const { Resend } = require('resend');

// Initialize Resend with the provided API Key
// Initialize Resend with API Key from env
// Initialize Resend with API Key from env
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

    // Append timestamp to bust email client caches (Gmail)
    return `${SITE_URL}/${cleanPath.split('/').map(encodeURIComponent).join('/')}?v=${Date.now()}`;
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
        let themeColor = '#3b82f6'; // Brand Blue (Lighter for dark mode visibility)
        let headerBg = '#1e293b'; // Slate 800
        let statusTitle = status.toUpperCase();
        let statusMessage = `Your order status has been updated to <strong style="color:${themeColor}">${status}</strong>.`;
        let additionalContent = '';

        if (status === 'Completed') {
            subject = `Order #${order.id} Completed! ✅`;
            themeColor = '#10b981'; // Emerald 500
            headerBg = 'rgba(16, 185, 129, 0.1)';
            statusMessage = `Great news! Your order has been completed successfully.`;

            if (updates.deliveryInfo) {
                additionalContent += `
                    <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 12px; margin: 25px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #34d399; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">📦 Delivery Info</h4>
                        <div style="font-family: 'Courier New', monospace; background: #0f172a; padding: 15px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); color: #34d399; white-space: pre-wrap; font-size: 14px;">${updates.deliveryInfo}</div>
                    </div>
                `;
            }

            if (updates.deliveryImage) {
                const imgUrl = resolveImage(updates.deliveryImage);
                additionalContent += `
                    <div style="margin: 20px 0; text-align: center;">
                        <h4 style="margin: 0 0 10px 0; color: #34d399; font-size: 14px; text-transform: uppercase;">📸 Delivery Attachment</h4>
                        <img src="${imgUrl}" style="max-width: 100%; border-radius: 8px; border: 1px solid #334155;">
                    </div>
                 `;
            }

            // Removed Delivery Proof Image as requested (Legacy)
        } else if (status === 'Cancelled') {
            subject = `Order #${order.id} Cancelled ❌`;
            themeColor = '#ef4444'; // Red 500
            headerBg = 'rgba(239, 68, 68, 0.1)';
            statusMessage = `Your order has been cancelled.`;

            if (updates.cancelReason) {
                additionalContent += `
                    <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); padding: 20px; border-radius: 12px; margin: 25px 0;">
                        <h4 style="margin: 0 0 5px 0; color: #f87171; font-size: 14px; text-transform: uppercase;">⚠️ Cancellation Reason</h4>
                        <p style="margin: 0; color: #fca5a5; font-size: 15px;">${updates.cancelReason}</p>
                    </div>
                    `;
            }
            // Removed Cancellation Proof Image as requested
        } else if (status === 'Refunded') {
            subject = `Order #${order.id} Refunded ↩️`;
            themeColor = '#a855f7'; // Purple 500
            headerBg = 'rgba(168, 85, 247, 0.1)';
            statusMessage = `A refund has been processed for your order.`;

            additionalContent += `
                    <div style="background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.2); padding: 20px; border-radius: 12px; margin: 25px 0;">
                    <h4 style="margin: 0 0 15px 0; color: #c084fc; font-size: 14px; text-transform: uppercase;">💰 Refund Details</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; color: #d8b4fe; width: 80px; font-weight: bold;">Method:</td>
                            <td style="padding: 5px 0; color: #e2e8f0;">${updates.refundMethod || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #d8b4fe; font-weight: bold;">TrxID:</td>
                            <td style="padding: 5px 0; color: #e2e8f0; font-family: monospace;">${updates.refundTrx || 'N/A'}</td>
                        </tr>
                        ${updates.refundNote ? `
                        <tr>
                            <td colspan="2" style="padding-top: 10px; color: #d8b4fe; font-style: italic; font-size: 13px;">"${updates.refundNote}"</td>
                        </tr>` : ''}
                    </table>
                </div>
                    `;
            // Removed Refund Proof Image as requested
        }

        // --- Items Table ---
        const itemsRows = order.items.map(item => {
            const itemPrice = parseFloat(item.price) * (item.quantity || 1);
            const priceFormatted = displayPrice(itemPrice);
            const imgUrl = resolveImage(item.image) || 'https://placehold.co/100x100/334155/FFF?text=Item';

            return `
                    <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #334155; width: 70px; vertical-align: top;">
                    <img src="${imgUrl}" alt="${item.name}" width="60" height="60" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid #475569; background: #334155;">
                </td>
                <td style="padding: 15px 15px; border-bottom: 1px solid #334155; vertical-align: top;">
                    <div style="font-weight: 600; color: #f8fafc; font-size: 15px;">${item.name}</div>
                    <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Variant: <span style="background: #334155; padding: 2px 6px; border-radius: 4px; color: #cbd5e1;">${item.variant || 'Default'}</span></div>
                </td>
                <td style="padding: 15px 0; border-bottom: 1px solid #334155; text-align: right; vertical-align: top;">
                    <div style="font-weight: 700; color: #f8fafc; font-size: 14px;">${priceFormatted}</div>
                    <div style="color: #94a3b8; font-size: 11px;">x${item.quantity || 1}</div>
                </td>
            </tr>
                    `;
        }).join('');

        // Payment Proof Section - Removing Image, Keeping TRX info if implies
        // User said "baki gola kate dao", likely wants the proof image gone.
        let paymentInfo = '';
        if (order.trx) {
            paymentInfo = `
                    <div style="margin-top: 30px; background: rgba(51, 65, 85, 0.5); border: 1px dashed #475569; border-radius: 12px; padding: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Your Payment Info</span>
                            <span style="font-family: monospace; font-size: 12px; color: #cbd5e1; background: #334155; padding: 2px 6px; border-radius: 4px; border: 1px solid #475569;">TRX: ${order.trx}</span>
                        </div>
                </div>
                    `;
        }
        // Removed order.proof image block

        // --- Final HTML Construction ---
        // Dark Theme Implementation with Table-based Layout for Email Compatibility
        const htmlContent = `
                    <!DOCTYPE html>
                        <html>
                            <head>
                                <meta charset="utf-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
                                            <style>
                                                body {margin: 0; padding: 0; background-color: #0f172a; font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; color: #f8fafc; }
                                                a {color: #3b82f6; text-decoration: none; }
                                                .wrapper {width: 100%; table-layout: fixed; background-color: #0f172a; padding-bottom: 40px; }
                                                .main {background - color: #1e293b; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 12px; border: 1px solid #334155; overflow: hidden; }
                                            </style>
                                        </head>
                                        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Outfit', 'Segoe UI', sans-serif; color: #f8fafc;">
                                            <center class="wrapper" style="width: 100%; table-layout: fixed; background-color: #0f172a; padding-bottom: 40px;">
                                                <table class="main" width="100%" cellpadding="0" cellspacing="0" style="background-color: #1e293b; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 12px; border: 1px solid #334155; border-spacing: 0;">

                                                    <!-- Header -->
                                                    <tr>
                                                        <td style="background: #020617; padding: 30px 20px; text-align: center; border-bottom: 1px solid #334155;">
                                                            <div style="font-size: 24px; font-weight: 800; color: white; letter-spacing: -0.5px;">
                                                                Tention<span style="color: #3b82f6;">Free</span>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    <!-- Status Banner -->
                                                    <tr>
                                                        <td style="background: ${headerBg}; padding: 40px 20px; text-align: center; border-bottom: 1px solid ${themeColor}30;">
                                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                                <tr>
                                                                    <td align="center">
                                                                        <div style="width: 64px; height: 64px; background: ${themeColor}20; border-radius: 50%; padding: 0; margin-bottom: 15px; border: 1px solid ${themeColor}40; box-shadow: 0 0 20px ${themeColor}20; display: inline-block; line-height: 64px;">
                                                                            <span style="font-size: 32px; color: ${themeColor}; line-height: 64px; display: block;">${status === 'Completed' ? '✓' : (status === 'Cancelled' ? '✕' : '↩')}</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="center">
                                                                        <h2 style="margin: 0; color: ${themeColor}; font-size: 24px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 10px ${themeColor}40;">${status.toUpperCase()}</h2>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="center">
                                                                        <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 15px;">Order #${order.id}</p>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>

                                                    <!-- Body -->
                                                    <tr>
                                                        <td style="padding: 40px 30px;">
                                                            <p style="font-size: 16px; color: #e2e8f0; margin-top: 0; line-height: 1.6;">
                                                                Hi <strong>${order.customer || 'Customer'}</strong>,<br><br>
                                                                    ${statusMessage}
                                                                </p>

                                                                    ${additionalContent}

                                                                    <!-- Items Section -->
                                                                    <div style="margin-top: 30px; background: rgba(15, 23, 42, 0.5); border-radius: 12px; padding: 20px; border: 1px solid #334155;">
                                                                        <h3 style="margin: 0 0 15px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Order Summary</h3>
                                                                        <table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                                                                            ${itemsRows}
                                                                        </table>

                                                                        <div style="margin-top: 20px; text-align: right; padding-top: 15px; border-top: 1px solid #334155;">
                                                                            <span style="color: #94a3b8; margin-right: 15px; font-size: 15px;">Total Amount</span>
                                                                            <span style="color: ${themeColor}; font-size: 24px; font-weight: 800;">${isUSD ? '$' : '৳'}${isUSD ? totalOrderPrice.toFixed(2) : totalOrderPrice}</span>
                                                                        </div>
                                                                    </div>

                                                                    ${paymentInfo}

                                                                    <table width="100%" style="margin-top: 40px;">
                                                                        <tr>
                                                                            <td align="center">
                                                                                <a href="${SITE_URL}/profile.html" style="background: #3b82f6; color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">View Order History</a>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>

                                                            <!-- Footer -->
                                                            <tr>
                                                                <td style="background: #020617; padding: 25px; text-align: center; border-top: 1px solid #334155;">
                                                                    <p style="margin: 0; color: #64748b; font-size: 12px;">&copy; 2025 Tention Free. All rights reserved.</p>
                                                                    <p style="margin: 8px 0 0 0; color: #475569; font-size: 12px;">Dhaka, Bangladesh</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </center>
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
