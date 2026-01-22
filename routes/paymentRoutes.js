const express = require('express');
const router = express.Router();
const axios = require('axios');
const { readLocalJSON, writeLocalJSON } = require('../data/db');
const { authenticateAdmin } = require('../middleware/auth');

// --- PAYMENT SETTINGS ---

// GET Payment Mode
router.get('/settings/payment-mode', async (req, res) => {
    try {
        const systemData = await readLocalJSON('system_data.json');
        res.json({ success: true, mode: systemData.payment_mode || 'auto' });
    } catch (err) {
        res.status(500).json({ success: false, mode: 'auto' });
    }
});

// UPDATE Payment Mode
router.post('/settings/payment-mode', authenticateAdmin, async (req, res) => {
    const { mode } = req.body; // 'auto' or 'manual'
    if (!['auto', 'manual'].includes(mode)) {
        return res.status(400).json({ success: false, message: "Invalid mode" });
    }

    try {
        const systemData = await readLocalJSON('system_data.json');
        systemData.payment_mode = mode;
        await writeLocalJSON('system_data.json', systemData);
        res.json({ success: true, message: `Payment mode set to ${mode}` });
    } catch (err) {
        console.error("Error updating payment mode:", err);
        res.status(500).json({ success: false, message: "Failed to update mode" });
    }
});

// --- PAY LATER SETTINGS ---

// GET Pay Later Status
router.get('/settings/pay-later', async (req, res) => {
    try {
        const systemData = await readLocalJSON('system_data.json');
        res.json({ success: true, enabled: systemData.payLater === true });
    } catch (err) {
        res.status(500).json({ success: false, enabled: false });
    }
});

// UPDATE Pay Later Status
router.post('/settings/pay-later', authenticateAdmin, async (req, res) => {
    const { enabled } = req.body; // boolean

    try {
        const systemData = await readLocalJSON('system_data.json');
        systemData.payLater = enabled === true;
        await writeLocalJSON('system_data.json', systemData);
        res.json({ success: true, message: `Pay Later ${enabled ? 'Enabled' : 'Disabled'}` });
    } catch (err) {
        console.error("Error updating pay later:", err);
        res.status(500).json({ success: false, message: "Failed to update settings" });
    }
});

// POST Create Payment
router.post('/payment/create', async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID required" });
    }

    try {
        // Check Payment Mode First
        const systemData = await readLocalJSON('system_data.json');
        const paymentMode = systemData.payment_mode || 'auto';

        const allOrders = await readLocalJSON('orders.json');
        const order = allOrders.find(o => o.id === orderId || o.id == orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // --- MANUAL MODE REDIRECT ---
        if (paymentMode === 'manual') {
            console.log(`ℹ️ Manual Payment Mode Active. Redirecting Order ${orderId}`);
            // Return local manual payment page URL
            return res.json({
                success: true,
                payment_url: `/manual-payment.html?orderId=${orderId}&amount=${order.price}`
            });
        }

        // --- AUTO MODE (Gateway) ---
        const API_KEY = process.env.NEXORA_API_KEY;

        if (!API_KEY) {
            console.error("❌ Link Error: NEXORA_API_KEY is missing in .env");
            return res.status(500).json({ success: false, message: "Payment Gateway Error" });
        }

        // NexoraPay Payload Construction
        const payload = {
            api_key: API_KEY,
            secret_key: process.env.NEXORA_SECRET_KEY,
            brand_key: process.env.NEXORA_BRAND_KEY,
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

        const GATEWAY_URL = "https://pay.nexorapay.top/api/payment/create";

        const response = await axios.post(GATEWAY_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
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
        return res.status(502).json({ success: false, message: "Payment Gateway Unreachable" });
    }
});

// POST Manual Payment Submit
router.post('/payment/manual-submit', async (req, res) => {
    const { orderId, method, sender, trx } = req.body;

    if (!orderId || !method || !sender || !trx) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const allOrders = await readLocalJSON('orders.json');
        const orderIndex = allOrders.findIndex(o => String(o.id) === String(orderId));

        if (orderIndex === -1) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const order = allOrders[orderIndex];

        // Update Order
        order.status = 'Pending'; // Admin needs to approve
        order.paymentMethod = `Manual (${method.toUpperCase()})`;
        order.trx = trx;
        order.senderNumber = sender;
        order.isHidden = false; // Show in Admin Panel
        order.date = new Date().toISOString(); // Update timestamp

        // Save
        allOrders[orderIndex] = order;
        await writeLocalJSON('orders.json', allOrders);

        // Notify Admin (Optional: Add email notification here if needed)
        console.log(`📝 Manual Payment Submitted: Order #${orderId} | Trx: ${trx}`);

        res.json({ success: true, message: "Payment submitted successfully" });

    } catch (err) {
        console.error("Manual Payment Error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

console.log("💳 Payment Routes Loaded (Live + Manual Mode)");

module.exports = router;
