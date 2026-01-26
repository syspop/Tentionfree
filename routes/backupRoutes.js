const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');
const { readLocalJSON: readDB } = require('../data/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

// MIDDLEWARE: Verify Backup Token
const verifyBackupToken = (req, res, next) => {
    let token = req.headers['authorization'] || req.query.token;

    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (!token) {
        return res.status(401).json({ success: false, error: "Access Denied: No Token Provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'backup_admin') {
            req.user = decoded;
            next();
        } else {
            return res.status(403).json({ success: false, error: "Access Denied: Insufficient Permissions" });
        }
    } catch (err) {
        return res.status(401).json({ success: false, error: "Invalid Token" });
    }
};

// BACKUP ENDPOINT (Now Secured with JWT)
router.get('/backup', verifyBackupToken, async (req, res) => {
    console.log("👉 Backup Endpoint Hit by:", req.user.id);
    try {
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

// BACKUP LOGIN (Secure 2FA -> Returns JWT)
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
            // Fallback for first time setup or broken state, maybe allow generic?
            // For now, STRICT: Must have 2FA
            return res.status(500).json({ success: false, message: "2FA Not Configured" });
        }

        // DEBUGGING LOGS
        console.log("--- 2FA DEBUG ---");
        console.log("Server Time:", new Date().toISOString());
        console.log("Input Token:", token.trim());
        // console.log("Secret Used:", systemData.backup2faSecret); // CAUTION: Only strict debug

        // Increased window to 10 (approx +/- 5 mins) to fix "OTP kaj kore na"
        const verified = speakeasy.totp.verify({
            secret: systemData.backup2faSecret,
            encoding: 'base32',
            token: token.trim(),
            window: 10
        });
        console.log("Verification Result:", verified);
        console.log("-----------------");

        if (verified) {
            // Generate Backup Token
            const sessionToken = jwt.sign(
                { id: 'backup_admin', role: 'backup_admin' },
                JWT_SECRET,
                { expiresIn: '1h' }
            );
            return res.json({ success: true, token: sessionToken });
        } else {
            return res.json({ success: false, message: "Invalid 2FA Code" });
        }
    }

    return res.status(401).json({ success: false, message: "Invalid Credentials" });
});

module.exports = router;
