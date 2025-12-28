const { Resend } = require('resend');

// Initialize Resend with the provided API Key
const resend = new Resend('re_bDeBjLUr_4294oKP1ujApneoPdQmFX2bf');

// Admin email (from your script.js)
const ADMIN_EMAIL = 'kaziemdadul4@gmail.com';

async function sendOrderEmail(order) {
    try {
        console.log(`Preparing to send email for Order #${order.id}...`);

        const { data, error } = await resend.emails.send({
            from: 'TentionFree <onboarding@resend.dev>', // Default testing domain
            to: [ADMIN_EMAIL], // Sending to admin
            subject: `New Order #${order.id} - ${order.status}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">New Order Received!</h2>
                    <p><strong>Order ID:</strong> #${order.id}</p>
                    <p><strong>Customer:</strong> ${order.customer} (${order.phone})</p>
                    <p><strong>Total:</strong> ${order.currency === 'USD' ? '$' : '৳'}${order.price}</p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    
                    <h3>Items:</h3>
                    <ul>
                        ${order.items.map(item => `<li>${item.name} x${item.quantity || 1}</li>`).join('')}
                    </ul>

                    <p style="margin-top: 20px;">
                        <a href="http://localhost:3000/chodir-vai.html" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Order</a>
                    </p>
                </div>
            `
        });

        if (error) {
            console.error('Resend API Error:', error);
            return { success: false, error };
        }

        console.log('Email sent successfully:', data);
        return { success: true, data };

    } catch (err) {
        console.error('Failed to send email:', err);
        return { success: false, error: err.message };
    }
}

module.exports = { sendOrderEmail };
