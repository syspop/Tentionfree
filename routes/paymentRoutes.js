const express = require('express');
const router = express.Router();
const axios = require('axios');
const { readLocalJSON } = require('../data/db');

// POST Create Payment
router.post('/payment/create', async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID required" });
    }

    try {
        const allOrders = await readLocalJSON('orders.json');
        const order = allOrders.find(o => o.id === orderId || o.id == orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Credentials from ENV
        const API_KEY = process.env.NEXORA_API_KEY;
        // Some gateways need Secret, some just API Key. We use what we found in env.

        if (!API_KEY) {
            console.error("❌ Link Error: NEXORA_API_KEY is missing in .env");
            return res.status(500).json({ success: false, message: "Payment Gateway Not Linked (Missing Key)" });
        }

        // NexoraPay Payload Construction
        // Note: Field names often vary (amount vs total_amount, cus_name vs customer_name).
        // I am using a standard structure commonly found in BD gateways (like Shurjopay/Aamarpay style).
        // If NexoraPay has specific docs, these keys might need adjustment.
        const payload = {
            api_key: API_KEY, // Sending key in body if required, or header
            order_id: String(order.id),
            amount: order.price,
            currency: "BDT",
            cus_name: order.customer,
            cus_email: order.email || "customer@tentionfree.store",
            cus_phone: order.phone,
            product_name: order.product || "Digital Product",
            success_url: `https://tentionfree.store/payment-success.html`,
            cancel_url: `https://tentionfree.store/payment-failed.html`,
            fail_url: `https://tentionfree.store/payment-failed.html`,
            desc: "Purchase from TentionFree"
        };

        console.log("💳 Creating Payment via NexoraPay...", { orderId: order.id, amount: order.price });

        // ENDPOINT: Using the most probable endpoint based on user request context. 
        // If this 404s, the user MUST provide the specific documentation URL.
        const GATEWAY_URL = "https://portal.nexorapay.com/api/payment/create";

        const response = await axios.post(GATEWAY_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${API_KEY}` // Sometimes needed
            },
            timeout: 10000 // 10s timeout
        });

        const data = response.data;

        if (data && data.status === 'success' && data.payment_url) {
            console.log("✅ Payment Created. Redirecting to:", data.payment_url);
            return res.json({ success: true, payment_url: data.payment_url });
        } else {
            console.error("❌ Payment Gateway Response Error:", data);
            return res.status(400).json({ success: false, message: "Gateway Error", details: data });
        }

    } catch (err) {
        console.error("⚡ Payment Request Failed:", err.message);
        if (err.response) {
            console.error("   Gateway Response:", err.response.data);
        }

        // Fallback removed. 
        return res.status(502).json({ success: false, message: "Payment Gateway Unreachable" });
    }
});

console.log("💳 Payment Routes Loaded (Live Mode)");

module.exports = router;
