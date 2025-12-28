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

    // Clean leading slash
    const cleanPath = img.replace(/^\//, '');

    // Enable this for debugging if needed, but for now just encode
    // console.log('Resolving Image:', cleanPath);

    return `${SITE_URL}/${cleanPath.split('/').map(encodeURIComponent).join('/')}`;
};

async function sendOrderStatusEmail(order, updates) {
    try {
        console.log(`Preparing ${updates.status} email for Order #${order.id}...`);

        const recipients = [];
        if (order.email) recipients.push(order.email);
        if (order.customerEmail) recipients.push(order.customerEmail);

        const uniqueRecipients = [...new Set(recipients)];

        if (uniqueRecipients.length === 0) {
            console.log("No customer email found. Skipping email.");
            return { success: false, message: "No customer email" };
        }

        const status = updates.status;

        // --- Currency Logic ---
        // Detect if we need to convert item prices (BDT) to USD
        let isUSD = (order.currency === 'USD' || order.paymentMethod === 'Binance Pay' || order.paymentMethod?.includes('Binance'));
        let exchangeRate = 1;

        const totalOrderPrice = parseFloat(order.price || order.totalAmount || 0);

        if (isUSD) {
            // Calculate implied exchange rate: Sum of BDT items / Total USD Price
            const totalItemsBDT = order.items.reduce((sum, i) => sum + (parseFloat(i.price) * (i.quantity || 1)), 0);
            if (totalOrderPrice > 0 && totalItemsBDT > 0) {
                // If total BDT is roughly 100x the USD price, we assume conversion happened
                if (totalItemsBDT > totalOrderPrice * 50) {
                    exchangeRate = totalItemsBDT / totalOrderPrice;
                }
            }
        }

        const displayPrice = (amountBDT) => {
            if (isUSD && exchangeRate > 1) {
                return `$${(amountBDT / exchangeRate).toFixed(2)}`;
            }
            return `৳${amountBDT}`;
        };


        // --- Theme & Content ---
        let subject = `Order #${order.id} Update`;
        let themeColor = '#2563eb'; // Blue
        let headerBg = '#f1f5f9';
        let statusTitle = status.toUpperCase();
        let statusMessage = `Your order status has been updated to <strong style="color:${themeColor}">${status}</strong>.`;
        let additionalContent = '';

        if (status === 'Completed') {
            subject = `Order #${order.id} Completed! ✅`;
            themeColor = '#10b981'; // Green
            headerBg = '#ecfdf5';
            statusMessage = `Great news! Your order has been completed successfully.`;

            if (updates.deliveryInfo) {
                additionalContent += `
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; margin: 25px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #15803d; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">📦 Delivery Info</h4>
                        <div style="font-family: 'Courier New', monospace; background: white; padding: 10px; border-radius: 6px; border: 1px solid #dcfce7; color: #15803d; white-space: pre-wrap; font-size: 14px;">${updates.deliveryInfo}</div>
                    </div>
                `;
            }
            if (updates.deliveryImage) {
                additionalContent += `
                    <div style="margin: 20px 0;">
                        <span style="font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase;">Delivery Proof</span>
                        <div style="margin-top: 5px; border-radius: 8px; overflow: hidden; border: 1px solid #eee;">
                            <img src="${resolveImage(updates.deliveryImage)}" style="width: 100%; display: block;" alt="Delivery Proof">
                        </div>
                    </div>
                `;
            }
        } else if (status === 'Cancelled') {
            subject = `Order #${order.id} Cancelled ❌`;
            themeColor = '#ef4444'; // Red
            headerBg = '#fef2f2';
            statusMessage = `Your order has been cancelled.`;

            if (updates.cancelReason) {
                additionalContent += `
                    <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 12px; margin: 25px 0;">
                        <h4 style="margin: 0 0 5px 0; color: #991b1b; font-size: 14px; text-transform: uppercase;">⚠️ Cancellation Reason</h4>
                        <p style="margin: 0; color: #7f1d1d; font-size: 15px;">${updates.cancelReason}</p>
                    </div>
                `;
            }
            if (updates.cancelImage) {
                additionalContent += `
                    <div style="margin: 20px 0;">
                         <span style="font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase;">Cancellation Proof</span>
                        <div style="margin-top: 5px; border-radius: 8px; overflow: hidden; border: 1px solid #eee; background: #fafafa;">
                            <img src="${resolveImage(updates.cancelImage)}" style="width: 100%; display: block;" alt="Proof">
                        </div>
                    </div>
                `;
            }
        } else if (status === 'Refunded') {
            subject = `Order #${order.id} Refunded ↩️`;
            themeColor = '#a855f7'; // Purple
            headerBg = '#faf5ff';
            statusMessage = `A refund has been processed for your order.`;

            additionalContent += `
                <div style="background: #faf5ff; border: 1px solid #e9d5ff; padding: 20px; border-radius: 12px; margin: 25px 0;">
                    <h4 style="margin: 0 0 15px 0; color: #7e22ce; font-size: 14px; text-transform: uppercase;">💰 Refund Details</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; color: #6b21a8; width: 80px; font-weight: bold;">Method:</td>
                            <td style="padding: 5px 0; color: #333;">${updates.refundMethod || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #6b21a8; font-weight: bold;">TrxID:</td>
                            <td style="padding: 5px 0; color: #333; font-family: monospace;">${updates.refundTrx || 'N/A'}</td>
                        </tr>
                        ${updates.refundNote ? `
                        <tr>
                            <td colspan="2" style="padding-top: 10px; color: #6b21a8; font-style: italic; font-size: 13px;">"${updates.refundNote}"</td>
                        </tr>` : ''}
                    </table>
                </div>
            `;
            if (updates.refundImage) {
                additionalContent += `
                     <div style="margin: 20px 0;">
                        <span style="font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase;">Refund Proof</span>
                        <div style="margin-top: 5px; border-radius: 8px; overflow: hidden; border: 1px solid #eee;">
                            <img src="${resolveImage(updates.refundImage)}" style="width: 100%; display: block;" alt="Refund Proof">
                        </div>
                    </div>
                `;
            }
        }

        // --- Items Table ---
        const itemsRows = order.items.map(item => {
            const itemPrice = parseFloat(item.price) * (item.quantity || 1);
            const priceFormatted = displayPrice(itemPrice);
            const imgUrl = resolveImage(item.image) || 'https://placehold.co/100x100/png?text=Item';

            return `
            <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #f1f5f9; width: 70px; vertical-align: top;">
                    <img src="${imgUrl}" alt="${item.name}" width="60" height="60" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0;">
                </td>
                <td style="padding: 15px 15px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <div style="font-weight: 600; color: #1e293b; font-size: 15px;">${item.name}</div>
                    <div style="color: #64748b; font-size: 12px; margin-top: 4px;">Variant: <span style="background: #f1f5f9; padding: 2px 6px; rounded: 4px;">${item.variant || 'Default'}</span></div>
                </td>
                <td style="padding: 15px 0; border-bottom: 1px solid #f1f5f9; text-align: right; vertical-align: top;">
                    <div style="font-weight: 700; color: #0f172a; font-size: 14px;">${priceFormatted}</div>
                    <div style="color: #94a3b8; font-size: 11px;">x${item.quantity || 1}</div>
                </td>
            </tr>
            `;
        }).join('');

        // Payment Proof Section
        let paymentInfo = '';
        if (order.proof || (order.trx && !order.proof)) {
            paymentInfo = `
                <div style="margin-top: 30px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 12px; font-weight: bold; color: #475569; text-transform: uppercase;">Your Payment Info</span>
                        ${order.trx ? `<span style="font-family: monospace; font-size: 12px; color: #64748b; background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">TRX: ${order.trx}</span>` : ''}
                    </div>
                    ${order.proof ? `
                        <div style="border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
                            <img src="${resolveImage(order.proof)}" style="width: 100%; display: block;" alt="Payment Proof">
                        </div>` : ''}
                </div>
            `;
        }

        // --- Final HTML Construction ---
        // Using a modern clean layout with a centered container
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                
                <!-- Header -->
                <div style="background: #0f172a; padding: 30px 20px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 800; color: white; letter-spacing: -0.5px;">
                        Tention<span style="color: #3b82f6;">Free</span>
                    </div>
                </div>

                <!-- Status Banner -->
                <div style="background: ${headerBg}; padding: 30px 40px; text-align: center; border-bottom: 1px solid ${themeColor}20;">
                    <div style="width: 60px; height: 60px; background: ${themeColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto; box-shadow: 0 4px 12px ${themeColor}40;">
                        <!-- Using simple UTF icons for better compatibility -->
                        <span style="font-size: 28px; line-height: 1; color: white;">${status === 'Completed' ? '✓' : (status === 'Cancelled' ? '✕' : '↩')}</span>
                    </div>
                    <h2 style="margin: 0; color: ${themeColor}; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">${status.toUpperCase()}</h2>
                    <p style="margin: 10px 0 0 0; color: #64748b; font-size: 15px;">Order #${order.id}</p>
                </div>

                <!-- Body -->
                <div style="padding: 40px;">
                    <p style="font-size: 16px; color: #334155; margin-top: 0; line-height: 1.6;">
                        Hi <strong>${order.customer || 'Customer'}</strong>,<br>
                        ${statusMessage}
                    </p>

                    ${additionalContent}

                    <!-- Items Section -->
                    <div style="margin-top: 30px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Order Summary</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            ${itemsRows}
                        </table>
                        
                        <div style="margin-top: 20px; text-align: right; padding-top: 15px; border-top: 2px solid #f1f5f9;">
                            <span style="color: #64748b; margin-right: 15px; font-size: 15px;">Total Amount</span>
                            <span style="color: ${themeColor}; font-size: 24px; font-weight: 800;">${isUSD ? '$' : '৳'}${isUSD ? totalOrderPrice.toFixed(2) : totalOrderPrice}</span>
                        </div>
                    </div>

                    ${paymentInfo}
                    
                    <div style="margin-top: 40px; text-align: center;">
                        <a href="${SITE_URL}/profile.html" style="background: #0f172a; color: white; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">View Order History</a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; 2025 Tention Free. All rights reserved.</p>
                    <p style="margin: 8px 0 0 0; color: #cbd5e1; font-size: 12px;">Dhaka, Bangladesh</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // --- Plain Text Version (For Anti-Spam & Fallback) ---
        const textContent = `
TentionFree - Order ${status}

Hi ${order.customer || 'Customer'},

${statusMessage.replace(/<[^>]*>/g, '')}

Order Details:
${order.items.map(i => `${i.name} (x${i.quantity || 1}) - ${displayPrice(parseFloat(i.price) * (i.quantity || 1))}`).join('\n')}

Total: ${isUSD ? '$' : '৳'}${isUSD ? totalOrderPrice.toFixed(2) : totalOrderPrice}

${updates.deliveryInfo ? `Delivery Info:\n${updates.deliveryInfo}` : ''}
${updates.cancelReason ? `Reason:\n${updates.cancelReason}` : ''}
${updates.refundMethod ? `Refund: ${updates.refundMethod} (Trx: ${updates.refundTrx})` : ''}

Track your order: ${SITE_URL}/profile.html
        `.trim();

        const { data, error } = await resend.emails.send({
            from: 'TentionFree <support@tentionfree.store>',
            to: uniqueRecipients,
            bcc: [ADMIN_EMAIL],
            reply_to: 'support@tentionfree.store',
            subject: subject,
            html: htmlContent,
            text: textContent
        });

        if (error) {
            console.error('Resend API Error:', error);
            return { success: false, error };
        }

        console.log('Status Email sent successfully (New Design):', data);
        return { success: true, data };

    } catch (err) {
        console.error('Failed to send status email:', err);
        return { success: false, error: err.message };
    }
}

module.exports = { sendOrderStatusEmail };
