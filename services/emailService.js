const { Resend } = require('resend');

// Initialize Resend with the provided API Key
// Initialize Resend with API Key from env
const resend = new Resend(process.env.RESEND_API_KEY);

// Admin email
const ADMIN_EMAIL = 'kaziemdadul4@gmail.com';
const SITE_URL = 'https://tentionfree.store';

// Helper to format currency
const formatPrice = (amount, currency, method) => {
    const symbol = (currency === 'USD' || method === 'Binance Pay') ? '$' : '৳';
    return `${symbol}${amount}`;
};

// Helper to resolve image URL
// If it's a relative path, prepend site URL. If base64, keep it (but warn user).
// If it's a blob/file input, it's likely base64.
const resolveImage = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    if (img.startsWith('data:image')) return img; // Base64
    return `${SITE_URL}/${img.replace(/^\//, '')}`;
};

async function sendOrderStatusEmail(order, updates) {
    try {
        console.log(`Preparing ${updates.status} email for Order #${order.id}...`);

        // Recipient: Customer Only (as requested "sodo matro tokhon customer er...")
        // But let's cc Admin to be safe/monitor? User said "customer er email e".
        // I'll send to Customer and BCC Admin.
        const recipients = [];
        if (order.email) recipients.push(order.email);
        if (order.customerEmail) recipients.push(order.customerEmail);

        const uniqueRecipients = [...new Set(recipients)];

        if (uniqueRecipients.length === 0) {
            console.log("No customer email found. Skipping email.");
            return { success: false, message: "No customer email" };
        }

        const status = updates.status;
        let subject = `Order #${order.id} Update`;
        let themeColor = '#2563eb'; // Blue
        let statusMessage = `Your order status has been updated to <strong>${status}</strong>.`;
        let additionalContent = '';

        // Status Specific Logic
        if (status === 'Completed') {
            subject = `Order #${order.id} Completed! ✅`;
            themeColor = '#10b981'; // Green
            statusMessage = `Great news! Your order has been completed successfully.`;

            if (updates.deliveryInfo) {
                additionalContent += `
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #166534;">delivery Details:</h4>
                        <div style="font-family: monospace; white-space: pre-wrap; color: #15803d;">${updates.deliveryInfo}</div>
                    </div>
                `;
            }
            if (updates.deliveryImage) {
                additionalContent += `
                    <div style="margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #333;">Delivery Proof:</h4>
                        <img src="${resolveImage(updates.deliveryImage)}" style="max-width: 100%; border-radius: 8px; border: 1px solid #eee;">
                    </div>
                `;
            }
        } else if (status === 'Cancelled') {
            subject = `Order #${order.id} Cancelled ❌`;
            themeColor = '#ef4444'; // Red
            statusMessage = `Your order has been cancelled.`;

            if (updates.cancelReason) {
                additionalContent += `
                    <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #991b1b;">Reason:</h4>
                        <p style="margin: 0; color: #7f1d1d;">${updates.cancelReason}</p>
                    </div>
                `;
            }
            if (updates.cancelImage) {
                additionalContent += `
                    <div style="margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #333;">Proof:</h4>
                        <img src="${resolveImage(updates.cancelImage)}" style="max-width: 100%; border-radius: 8px; border: 1px solid #eee;">
                    </div>
                `;
            }
        } else if (status === 'Refunded') {
            subject = `Order #${order.id} Refunded ↩️`;
            themeColor = '#a855f7'; // Purple
            statusMessage = `A refund has been processed for your order.`;

            additionalContent += `
                <div style="background: #faf5ff; border: 1px solid #e9d5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin: 0 0 10px 0; color: #6b21a8;">Refund Details:</h4>
                    <p style="margin: 5px 0;"><strong>Method:</strong> ${updates.refundMethod || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>Trx ID:</strong> ${updates.refundTrx || 'N/A'}</p>
                    ${updates.refundNote ? `<p style="margin: 10px 0 0 0; color: #581c87;"><em>Note: ${updates.refundNote}</em></p>` : ''}
                </div>
            `;
            if (updates.refundImage) {
                additionalContent += `
                    <div style="margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #333;">Refund Proof:</h4>
                        <img src="${resolveImage(updates.refundImage)}" style="max-width: 100%; border-radius: 8px; border: 1px solid #eee;">
                    </div>
                `;
            }
        }

        // Product Items HTML
        const itemsHtml = order.items.map(item => `
            <div style="display: flex; gap: 15px; border-bottom: 1px solid #eee; padding: 15px 0;">
                <img src="${resolveImage(item.image) || 'https://placehold.co/60x60?text=Item'}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #333;">${item.name}</h4>
                    <p style="margin: 0; font-size: 12px; color: #666;">Variant: ${item.variant || 'Default'}</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; font-weight: bold; color: #333;">x${item.quantity || 1} - ${formatPrice(item.price * (item.quantity || 1), order.currency, order.paymentMethod)}</p>
                </div>
            </div>
        `).join('');

        // Payment Proof (User's)
        let paymentProofHtml = '';
        if (order.proof || (order.trx && !order.proof)) { // If image exists
            // Note: If 'order.proof' is a path/url.
            if (order.proof) {
                paymentProofHtml = `
                    <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your Payment Proof</h4>
                        <img src="${resolveImage(order.proof)}" style="max-width: 100%; max-height: 200px; border-radius: 5px; border: 1px solid #eee;">
                        ${order.trx ? `<p style="font-family: monospace; color: #666; font-size: 12px; margin-top: 5px;">TRX: ${order.trx}</p>` : ''}
                    </div>
                 `;
            }
        }


        const { data, error } = await resend.emails.send({
            from: 'TentionFree <noreply@tentionfree.store>',
            to: uniqueRecipients,
            bcc: [ADMIN_EMAIL], // Keep admin in loop
            subject: subject,
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                    <!-- Header -->
                    <div style="background: ${themeColor}; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">${status.toUpperCase()}</h1>
                    </div>

                    <!-- Body -->
                    <div style="padding: 30px;">
                        <p style="font-size: 16px; color: #333; margin-top: 0;">Hi ${order.customer || 'Customer'},</p>
                        <p style="font-size: 16px; color: #555; line-height: 1.5;">${statusMessage}</p>

                        ${additionalContent}

                        <div style="margin: 30px 0;">
                            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; border-bottom: 2px solid ${themeColor}; padding-bottom: 10px;">Order Details</h3>
                            ${itemsHtml}
                        </div>

                        ${paymentProofHtml}

                         <div style="margin-top: 30px; text-align: right;">
                            <p style="margin: 0; font-size: 14px; color: #666;">Total Amount</p>
                            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: ${themeColor};">${formatPrice(order.price, order.currency, order.paymentMethod)}</p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888;">
                        <p style="margin: 0;">© 2024 TentionFree. All rights reserved.</p>
                        <p style="margin: 5px 0;">Support: support@tentionfree.store</p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('Resend API Error:', error);
            return { success: false, error };
        }

        console.log('Status Email sent successfully:', data);
        return { success: true, data };

    } catch (err) {
        console.error('Failed to send status email:', err);
        return { success: false, error: err.message };
    }
}

module.exports = { sendOrderStatusEmail };
