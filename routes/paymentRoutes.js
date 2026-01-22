const express = require('express');
const router = express.Router();
const axios = require('axios');
const { readLocalJSON, writeLocalJSON } = require('../data/db');

// POST Create Payment
router.post('/payment/create', async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID required" });
    }

    try {
        const allOrders = await readLocalJSON('orders.json');
        const order = allOrders.find(o => o.id === orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Credentials from ENV
        const API_KEY = process.env.NEXORA_API_KEY;
        const SECRET_KEY = process.env.NEXORA_SECRET_KEY;

        if (!API_KEY) {
            console.error("Missing NEXORA_API_KEY");
            return res.status(500).json({ success: false, message: "Payment Gateway Config Error" });
        }

        // TODO: Replace with ACTUAL NexoraPay Endpoint if known.
        // Assuming a standard payload structure.
        const payload = {
            amount: order.price,
            currency: 'BDT',
            order_id: String(order.id),
            cus_name: order.customer,
            cus_phone: order.phone,
            cus_email: order.email || 'customer@tentionfree.store',
            success_url: `https://tentionfree.store/payment-success?oid=${order.id}`,
            fail_url: `https://tentionfree.store/payment-failed?oid=${order.id}`,
            cancel_url: `https://tentionfree.store/payment-cancel?oid=${order.id}`,
            desc: `Payment for Order #${order.id}`
        };

        console.log("[Payment] Initiating NexoraPay:", payload);

        // --- MOCK IMPLEMENTATION (UNTIL ENDPOINT KNOWN) ---
        // For now, we simulate success for testing the flow, or return a placeholder URL.
        // Since we don't have the real URL, we cannot make the axios call succeed unless we know it.
        // I will return a dummy URL that alerts the user.

        // UNCOMMENT BELOW WHEN ENDPOINT IS KNOWN
        /*
        const response = await axios.post('https://api.nexorapay.com/v1/create', payload, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (response.data && response.data.payment_url) {
             return res.json({ success: true, payment_url: response.data.payment_url });
        }
        */

        // MOCK RESPONSE
        res.json({
            success: true,
            payment_url: `https://tentionfree.store/payment-mock-success?oid=${order.id}&amount=${order.price}`, // Internal redirect to verify flow
            message: "Mock Payment URL generated (Gateway endpoint missing)"
        });

    } catch (err) {
        console.error("Payment Create Error:", err);
        res.status(500).json({ success: false, message: "Server Error initiating payment" });
    }
});

module.exports = router;
