const express = require('express');
const router = express.Router();
const { writeLocalJSON: writeDB, readLocalJSON: readDB } = require('../data/db');
const { sendOrderStatusEmail } = require('../backend_services/emailService');
const { processAutoDelivery } = require('../utils/autoDelivery');
const { authenticateAdmin, authenticateUser } = require('../middleware/auth');
const Mutex = require('../utils/mutex');
const jwt = require('jsonwebtoken');

const orderMutex = new Mutex();

// GET Orders - PROTECTED (Paginated)
router.get('/orders', authenticateAdmin, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type || 'all';
    const skip = (page - 1) * limit;

    try {
        let allOrders = await readDB('orders.json');
        allOrders.sort((a, b) => (b.id || 0) - (a.id || 0));

        if (type === 'active') {
            allOrders = allOrders.filter(o => !o.isArchived && !o.isDeleted && o.status !== 'Deleted');
        }

        const total = allOrders.length;
        const visibleOrders = allOrders.filter(o => !o.isHidden).slice(skip, skip + limit);
        const orders = visibleOrders;

        res.json({
            orders,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read orders' });
    }
});

// POST Order (Add NEW Order from Checkout)
router.post('/orders', async (req, res) => {
    const unlock = await orderMutex.lock();
    try {
        const newOrder = req.body;
        const customers = await readDB('customers.json') || [];

        if (newOrder.userId && !newOrder.userId.startsWith('guest')) {
            const user = customers.find(c => c.id === newOrder.userId);
            if (user && user.isBanned) {
                return res.json({ success: false, message: "Your account is banned. Cannot place order." });
            }
        }

        const bannedUser = customers.find(c => c.isBanned && (c.email === newOrder.email || c.phone === newOrder.phone));
        if (bannedUser) {
            return res.json({ success: false, message: "This email or phone is associated with a banned account." });
        }

        const allOrders = await readDB('orders.json');

        if (!newOrder.id) {
            const maxId = allOrders.reduce((max, o) => (o.id > max ? o.id : max), 0);
            newOrder.id = maxId + 1;
        }

        // --- AUTO-DELIVERY & STOCK CHECK ---
        for (const item of newOrder.items) {
            const prod = allOrders.find(p => String(p.id) === String(item.id)) ||
                (await readDB('products.json')).find(p => String(p.id) === String(item.id) || p.name === item.name);

            if (prod && prod.autoStockOut) {
                const hasVariants = prod.variants && Array.isArray(prod.variants) && prod.variants.length > 0;
                let hasStock = false;

                if (hasVariants) {
                    const vIndex = prod.variants.findIndex(v => v.label === item.plan || v.label === item.variantName || (item.variant && v.label === item.variant.label));
                    if (vIndex !== -1) {
                        const v = prod.variants[vIndex];
                        const available = v.stock && Array.isArray(v.stock) ? v.stock.filter(s => typeof s === 'string' || (s.status === 'available' || !s.status)).length : 0;
                        if (available > 0) hasStock = true;
                    }
                }

                if (!hasStock) {
                    return res.status(400).json({ success: false, message: `Product '${prod.name}' is presently Out of Stock.` });
                }
            }
        }

        const isFreeAuto = parseFloat(newOrder.price) <= 0 && newOrder.paymentMethod === 'Free / Auto-Delivery';
        const result = await processAutoDelivery(newOrder, isFreeAuto);

        newOrder.deliveryInfo = result.deliveryInfo;

        if (result.status === 'Completed') {
            newOrder.status = 'Completed';
        } else if (result.status && result.status !== newOrder.status) {
            if (!newOrder.status) newOrder.status = 'Pending';
        }

        if (newOrder.status === 'Completed' || (newOrder.deliveryInfo && isFreeAuto)) {
            const emailUpdates = {
                status: newOrder.status,
                deliveryInfo: newOrder.deliveryInfo
            };
            sendOrderStatusEmail(newOrder, emailUpdates).catch(e => console.error("Auto-Email Error:", e));
        }

        // Coupon Usage
        if (newOrder.couponCode) {
            try {
                const coupons = await readDB('coupons.json');
                const couponIndex = coupons.findIndex(c => c.code === newOrder.couponCode);
                if (couponIndex !== -1) {
                    const c = coupons[couponIndex];
                    c.usageCount = (c.usageCount || 0) + 1;
                    if (newOrder.customer && newOrder.customer.id) {
                        const uid = newOrder.customer.id;
                        if (!c.usageByUsers) c.usageByUsers = {};
                        c.usageByUsers[uid] = (c.usageByUsers[uid] || 0) + 1;
                    }
                    await writeDB('coupons.json', coupons);
                }
            } catch (err) {
                console.error("Failed to update coupon usage:", err);
            }
        }

        if (newOrder.paymentMethod !== 'Free / Auto-Delivery' && newOrder.paymentMethod !== 'Pay Later') {
            newOrder.isHidden = true;
        }

        allOrders.push(newOrder);
        await writeDB('orders.json', allOrders);

        res.json({ success: true, message: 'Order created successfully', orderId: newOrder.id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Failed to save order', details: err.message });
    } finally {
        unlock();
    }
});

// Update Orders Backup (Overwrite ALL) - PROTECTED
router.put('/orders', authenticateAdmin, async (req, res) => {
    const orders = req.body;
    try {
        await writeDB('orders.json', orders);
        res.json({ success: true, message: 'Orders updated successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Failed to update orders' });
    }
});

// Update Single Order
router.put('/orders/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;

    const unlock = await orderMutex.lock();
    try {
        const allOrders = await readDB('orders.json');
        const orderIndex = allOrders.findIndex(o => o.id === id);

        if (orderIndex === -1) {
            unlock();
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const updatedOrder = { ...allOrders[orderIndex], ...updates };
        allOrders[orderIndex] = updatedOrder;

        await writeDB('orders.json', allOrders);

        // AUTO RESTOCK ON CANCEL/REFUND/FAILED
        if (updates.status && (updates.status === 'Cancelled' || updates.status === 'Refunded' || updates.status === 'Failed')) {
            try {
                const allProducts = await readDB('products.json');
                let stockRestored = false;

                allProducts.forEach(p => {
                    if (p.variants) {
                        p.variants.forEach(v => {
                            if (v.stock && Array.isArray(v.stock)) {
                                v.stock.forEach(s => {
                                    if (typeof s !== 'string' && String(s.orderId) === String(id)) {
                                        s.status = 'available';
                                        s.orderId = null;
                                        delete s.date;
                                        stockRestored = true;
                                    }
                                });
                            }
                        });
                    }
                });

                if (stockRestored) {
                    await writeDB('products.json', allProducts);
                    console.log(`[STOCK RESTORED] Order #${id} was cancelled/refunded/failed. Stock released.`);
                }
            } catch (e) {
                console.error("Failed to restore stock:", e);
            }
        }

        // Send Status Email
        if (updates.status && ['Completed', 'Cancelled', 'Refunded', 'Failed'].includes(updates.status)) {
            try {
                const allProducts = await readDB('products.json');
                const enrichedOrder = { ...updatedOrder };
                if (enrichedOrder.items && Array.isArray(enrichedOrder.items)) {
                    enrichedOrder.items = enrichedOrder.items.map(item => {
                        const p = allProducts.find(prod => prod.name === item.name);
                        return {
                            ...item,
                            image: p ? p.image : (item.image || null)
                        };
                    });
                }
                sendOrderStatusEmail(enrichedOrder, updates).catch(e => console.error("Email Error:", e));
            } catch (e) {
                console.error("Failed to prepare email data:", e);
            }
        }

        res.json({ success: true, message: "Order updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to update order" });
    } finally {
        unlock();
    }
});

// GET Single Order (Full Details)
router.get('/orders/:id', async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        let user = null;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            user = decoded;
        } catch (e) {
            return res.status(401).json({ error: 'Invalid Token' });
        }

        const id = parseInt(req.params.id);
        const allOrders = await readDB('orders.json') || [];
        const order = allOrders.find(o => o.id === id);

        if (!order) return res.status(404).json({ error: 'Order not found' });

        const isAdmin = user && user.role === 'admin';
        const isOwner = user && user.email && order.email && user.email.toLowerCase() === order.email.toLowerCase();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: 'Access denied: You do not own this order.' });
        }

        if (!isAdmin && order.status !== 'Completed') {
            delete order.deliveryInfo;
            delete order.deliveryImage;
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET My Orders (User)
router.get('/my-orders', authenticateUser, async (req, res) => {
    const userEmail = req.user.email.toLowerCase().trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const allOrders = await readDB('orders.json') || [];
        const myOrdersFull = allOrders.filter(o => o.email && o.email.toLowerCase().trim() === userEmail && !o.isHidden);

        myOrdersFull.sort((a, b) => (b.id || 0) - (a.id || 0));

        const total = myOrdersFull.length;
        const sliced = myOrdersFull.slice(skip, skip + limit);

        const orders = sliced.map(o => ({
            id: o.id,
            date: o.date,
            status: o.status,
            price: o.price,
            currency: o.currency,
            paymentMethod: o.paymentMethod,
            trx: o.trx,
            items: o.items,
            customer: o.customer,
            phone: o.phone,
            email: o.email,
            deliveryInfo: o.status === 'Completed' ? o.deliveryInfo : undefined,
            cancelReason: o.cancelReason,
            refundMethod: o.refundMethod,
            refundTrx: o.refundTrx,
            refundNote: o.refundNote,
            gameUid: o.gameUid,
            couponCode: o.couponCode,
            discount: o.discount || 0,
            totalAmount: o.totalAmount || o.price,
            deliveryImage: o.deliveryImage,
            cancelImage: o.cancelImage
        }));

        res.json({
            orders,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read orders' });
    }
});

module.exports = router;
