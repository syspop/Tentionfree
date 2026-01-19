const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const { readLocalJSON: readDB } = require('../data/db');
require('dotenv').config();

// BACKUP ENDPOINT
router.all('/backup', async (req, res) => {
    console.log("👉 Backup Endpoint Hit!");
    try {
        let pin = (req.body && req.body.pin) || req.query.pin || req.headers['x-backup-pin'];

        if (pin) pin = pin.toString().trim();

        const SECURE_PIN = process.env.BACKUP_PIN || "520099";

        if (!SECURE_PIN) {
            console.error("FATAL ERROR: BACKUP_PIN is not set in environment variables!");
            return res.status(500).json({ success: false, error: "Server Configuration Error: PIN not set." });
        }

        if (pin !== SECURE_PIN) {
            console.warn(`⚠️ Unauthorized Pin: '${pin}'`);
            return res.status(403).json({ success: false, error: "Access Denied: Invalid Security PIN." });
        }

        console.log("Generating Backup...");
        // Fast Read
        const backupData = {
            timestamp: new Date().toISOString(),
            customers: await readDB('customers.json') || [],
            orders: await readDB('orders.json') || [],
            products: await readDB('products.json') || [],
            coupons: await readDB('coupons.json') || [],
            categories: await readDB('categories.json') || [],
            reviews: await readDB('reviews.json') || [],
            archive: {
                orders: await readDB('archive/orders.json') || [],
                customers: await readDB('archive/customers.json') || [],
                products: await readDB('archive/products.json') || [],
                tickets: await readDB('archive/tickets.json') || []
            }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=tentionfree_full_backup_${Date.now()}.json`);
        res.json(backupData);
    } catch (err) {
        console.error("Backup Error:", err);
        res.status(500).json({ success: false, error: "Failed to generate backup." });
    }
});

// BACKUP LOGIN (Secure 2FA)
router.post('/backup-login', async (req, res) => {
    const { u, p, token } = req.body;

    const CORRECT_USER = process.env.BACKUP_USER || "haque@12MW";
    const CORRECT_PASS = process.env.BACKUP_PASS || "sowrov@12MW";

    if (!CORRECT_USER || !CORRECT_PASS) {
        return res.status(500).json({ success: false, message: "Server Configuration Error" });
    }

    if (!u || !p) {
        return res.status(401).json({ success: false });
    }

    const final_u = u.trim();
    const final_p = p.trim();

    if (final_u === CORRECT_USER && final_p === CORRECT_PASS) {
        if (!token) {
            return res.json({ success: false, require2fa: true });
        }

        const systemData = await readDB('system_data.json');
        if (!systemData || !systemData.backup2faSecret) {
            console.error("Backup 2FA Secret Missing!");
            return res.status(500).json({ success: false, message: "2FA Not Configured" });
        }

        const verified = speakeasy.totp.verify({
            secret: systemData.backup2faSecret,
            encoding: 'base32',
            token: token.trim(),
            window: 2
        });

        if (verified) {
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: "Invalid 2FA Code" });
        }
    }

    return res.status(401).json({ success: false, message: "Invalid Credentials" });
});

module.exports = router;
