const express = require('express');
const router = express.Router();
const { writeLocalJSON: writeDB, readLocalJSON: readDB } = require('../data/db');
const { authenticateAdmin } = require('../middleware/auth');

// Verify Coupon (Public)
router.post('/coupons/verify', async (req, res) => {
    const { code, cartTotal, cartItems, userId } = req.body;
    if (!code) return res.json({ success: false, message: "Code required" });

    try {
        const coupons = await readDB('coupons.json') || [];
        const coupon = coupons.find(c => c.code === code.trim().toUpperCase() && c.isActive);

        if (!coupon) {
            return res.json({ success: false, message: "Invalid or inactive coupon." });
        }

        if (coupon.expiryDate) {
            const now = new Date();
            const expiry = new Date(coupon.expiryDate);
            if (now > expiry) {
                const updatedCoupons = coupons.filter(c => c.id !== coupon.id);
                await writeDB('coupons.json', updatedCoupons);
                return res.json({ success: false, message: "This coupon has expired." });
            }
        }

        if (coupon.maxUsage && coupon.maxUsage > 0) {
            if ((coupon.usageCount || 0) >= coupon.maxUsage) {
                return res.json({ success: false, message: "Coupon usage limit reached." });
            }
        }

        if (coupon.maxUserUsage && coupon.maxUserUsage > 0) {
            if (!userId) {
                return res.json({ success: false, message: "Please Login to use this coupon." });
            }
            const userUsage = (coupon.usageByUsers && coupon.usageByUsers[userId]) || 0;
            if (userUsage >= coupon.maxUserUsage) {
                return res.json({ success: false, message: "You have reached your usage limit for this coupon." });
            }
        }

        if (coupon.minSpend && cartTotal < coupon.minSpend) {
            return res.json({ success: false, message: `Minimum spend of ৳${coupon.minSpend} required.` });
        }

        let applicableTotal = cartTotal;

        if (coupon.applicableProducts && coupon.applicableProducts.length > 0 && !coupon.applicableProducts.includes('all')) {
            if (!cartItems || !Array.isArray(cartItems)) {
                return res.json({ success: false, message: "Unable to verify product eligibility." });
            }

            const validProductIds = coupon.applicableProducts.map(id => String(id));
            const validItems = cartItems.filter(item => validProductIds.includes(String(item.id)));

            if (validItems.length === 0) {
                return res.json({ success: false, message: "This coupon is not applicable for the products in your cart." });
            }

            applicableTotal = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        let discountAmount = 0;
        if (coupon.type === 'percent') {
            discountAmount = (applicableTotal * coupon.discount) / 100;
        } else {
            discountAmount = coupon.discount;
        }

        if (discountAmount > applicableTotal) discountAmount = applicableTotal;

        res.json({
            success: true,
            discount: discountAmount,
            couponCode: coupon.code,
            type: coupon.type,
            value: coupon.discount
        });

    } catch (err) {
        console.error("Coupon verify error:", err);
        res.status(500).json({ success: false, message: "Server error", details: err.message });
    }
});

// Admin: Get All Coupons
router.get('/coupons', authenticateAdmin, async (req, res) => {
    try {
        const coupons = await readDB('coupons.json') || [];

        const now = new Date();
        const activeCoupons = coupons.filter(c => {
            if (!c.expiryDate) return true;
            return new Date(c.expiryDate) > now;
        });

        if (activeCoupons.length !== coupons.length) {
            await writeDB('coupons.json', activeCoupons);
            console.log(`[CLEANUP] Deleted ${coupons.length - activeCoupons.length} expired coupons.`);
        }

        res.json(activeCoupons);
    } catch (err) {
        res.status(500).json({ error: "Failed to load coupons" });
    }
});

// Admin: Create Coupon
router.post('/coupons', authenticateAdmin, async (req, res) => {
    const { code, discount, type, minSpend, isActive, applicableProducts, maxUsage, maxUserUsage } = req.body;
    if (!code || !discount || !type) return res.status(400).json({ error: "Missing fields" });

    try {
        const coupons = await readDB('coupons.json') || [];

        if (coupons.find(c => c.code === code.toUpperCase())) {
            return res.status(400).json({ error: "Coupon code already exists!" });
        }

        let expiryDate = null;
        if (req.body.expireTime && req.body.expireTime > 0) {
            const duration = parseFloat(req.body.expireTime);
            const type = req.body.expireType || 'days';
            const now = new Date();
            if (type === 'minutes') now.setMinutes(now.getMinutes() + duration);
            else if (type === 'hours') now.setHours(now.getHours() + duration);
            else now.setDate(now.getDate() + duration);

            expiryDate = now.toISOString();
        }

        const newCoupon = {
            id: Date.now(),
            code: code.toUpperCase(),
            discount: parseFloat(discount),
            type,
            minSpend: parseFloat(minSpend) || 0,
            applicableProducts: Array.isArray(applicableProducts) ? applicableProducts : ['all'],
            maxUsage: parseInt(maxUsage) || 0,
            maxUserUsage: parseInt(maxUserUsage) || 0,
            usageCount: 0,
            usageByUsers: {},
            isActive: isActive !== false,
            createdAt: new Date().toISOString(),
            expiryDate: expiryDate
        };

        coupons.push(newCoupon);
        await writeDB('coupons.json', coupons);
        res.json({ success: true, coupon: newCoupon });
    } catch (err) {
        console.error("Coupon Save Error:", err);
        res.status(500).json({ error: "Failed to save coupon", details: err.message });
    }
});

// Admin: Delete Coupon
router.delete('/coupons/:id', authenticateAdmin, async (req, res) => {
    const id = req.params.id;
    try {
        let coupons = await readDB('coupons.json') || [];
        const initialLength = coupons.length;

        // Use loose comparison or string conversion for robust ID matching
        coupons = coupons.filter(c => String(c.id) !== String(id));

        if (coupons.length === initialLength) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        await writeDB('coupons.json', coupons);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete coupon" });
    }
});

// Admin: Update Coupon
router.put('/coupons/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;

    try {
        let coupons = await readDB('coupons.json') || [];
        const index = coupons.findIndex(c => c.id === id);
        if (index === -1) return res.status(404).json({ error: "Coupon not found" });

        if (updates.maxUsage !== undefined) coupons[index].maxUsage = parseInt(updates.maxUsage);
        if (updates.maxUserUsage !== undefined) coupons[index].maxUserUsage = parseInt(updates.maxUserUsage);
        if (updates.isActive !== undefined) coupons[index].isActive = updates.isActive;

        await writeDB('coupons.json', coupons);
        res.json({ success: true, coupon: coupons[index] });
    } catch (err) {
        res.status(500).json({ error: "Failed to update coupon" });
    }
});

module.exports = router;
