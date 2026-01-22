const express = require('express');
const router = express.Router();
const axios = require('axios');
const { readLocalJSON, writeLocalJSON } = require('../data/db');
const { authenticateAdmin } = require('../middleware/auth');

// GET Payment Mode
router.get('/settings/payment-mode', async (req, res) => {
    try {
        const systemData = await readLocalJSON('system_data.json');
        res.json({ success: true, mode: systemData.payment_mode || 'auto' });
    } catch (err) {
        res.json({ success: true, mode: 'auto' });
    }
});

// UPDATE Payment Mode
router.post('/settings/payment-mode', authenticateAdmin, async (req, res) => {
    const { mode } = req.body;
    if (!['auto', 'manual'].includes(mode)) {
        return res.status(400).json({ success: false, message: "Invalid mode" });
    }

    try {
        const systemData = await readLocalJSON('system_data.json');
        systemData.payment_mode = mode;
        await writeLocalJSON('system_data.json', systemData);
        res.json({ success: true, message: Payment mode set to ${mode} });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update mode" });
    }
});

// CREATE PAYMENT
router.post('/payment/create', async (req, res) => {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: "Order ID required" });

    try {
        const systemData = await readLocalJSON('system_data.json');
        const paymentMode = systemData.payment_mode || 'auto';

        const allOrders = await readLocalJSON('orders.json');
        const order = allOrders.find(o => String(o.id) === String(orderId));
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        if (paymentMode === 'manual') {
            return res.json({
                success: true,
                payment_url: /manual-payment.html?orderId=${orderId}&amount=${order.price}
            });
        }

        if (!process.env.NEXORA_API_KEY || !process.env.NEXORA_SECRET_KEY || !process.env.NEXORA_BRAND_KEY) {
            return res.status(500).json({ success: false, message: "Payment Gateway Not Configured" });
        }

        const payload = {
            api_key: process.env.NEXORA_API_KEY,
            secret_key: process.env.NEXORA_SECRET_KEY,
            brand_key: process.env.NEXORA_BRAND_KEY,
            order_id: String(order.id),
            amount: Number(order.price),
            currency: "BDT",
            cus_name: order.customer || "Customer",
            cus_email: order.email || "customer@example.com",
            cus_phone: order.phone || "01700000000",
            product_name: order.product || "Digital Product",
            success_url: "https://tentionfree.store/payment-success.html",
            cancel_url: "https://tentionfree.store/payment-failed.html",
            fail_url: "https://tentionfree.store/payment-failed.html",
            desc: Order #${order.id} Payment
        };

        const response = await axios.post("https://pay.nexorapay.top/api/payment/create", payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
        });

        const data = response.data;

        if (data && (data.status === "success" || data.success === true) && data.payment_url) {
            order.payment_url = data.payment_url;
            order.status = "Unpaid";
            await writeLocalJSON('orders.json', allOrders);

            return res.json({ success: true, payment_url: data.payment_url });
        }

        return res.status(400).json({ success: false, message: "Gateway Error", details: data });

    } catch (err) {
        return res.status(502).json({ success: false, message: "Payment Gateway Unreachable" });
    }
});

// MANUAL PAYMENT SUBMIT
router.post('/payment/manual-submit', async (req, res) => {
    const { orderId, method, sender, trx } = req.body;
    if (!orderId || !method || !sender || !trx) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const allOrders = await readLocalJSON('orders.json');
        const index = allOrders.findIndex(o => String(o.id) === String(orderId));
        if (index === -1) return res.status(404).json({ success: false, message: "Order not found" });

        const order = allOrders[index];
        order.status = "Pending";
        order.paymentMethod = Manual (${method.toUpperCase()});
        order.trx = trx;
        order.senderNumber = sender;
        order.isHidden = false;
        order.date = new Date().toISOString();

        allOrders[index] = order;
        await writeLocalJSON('orders.json', allOrders);

        res.json({ success: true, message: "Payment submitted successfully" });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
