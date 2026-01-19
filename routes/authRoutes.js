const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { writeLocalJSON: writeDB, readLocalJSON: readDB } = require('../data/db');
const { sendOtpEmail } = require('../backend_services/emailService');
const { JWT_SECRET } = require('../middleware/auth');
const speakeasy = require('speakeasy');

// --- PENDING REGISTRATION STORE ---
const pendingUsers = {}; // { email: { userData, otp, expires, attempts } }

// POST Register (Step 1: Send OTP)
router.post('/register', async (req, res) => {
    const { name, email: rawEmail, phone, password } = req.body;

    if (!name || !rawEmail || !password) {
        return res.json({ success: false, message: "Missing required fields" });
    }

    const email = rawEmail.toLowerCase().trim();

    // Input Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.json({ success: false, message: "Invalid email format" });
    }

    // --- DOMAIN WHITELIST CHECK ---
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com', 'icloud.com', 'msn.com'];
    const domain = email.split('@')[1];
    if (!allowedDomains.includes(domain)) {
        return res.status(400).json({
            success: false,
            message: "We only accept registration from trusted email providers (Gmail, Yahoo, Outlook, iCloud)."
        });
    }
    if (password.length < 6) {
        return res.json({ success: false, message: "Password must be at least 6 characters" });
    }
    if (phone && !/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) {
        return res.json({ success: false, message: "Invalid phone number" });
    }

    try {
        const allCustomers = await readDB('customers.json');

        // Check duplicate
        const emailExists = allCustomers.find(c => c.email === email);
        if (emailExists) {
            return res.json({ success: false, message: "Email already registered" });
        }

        // Check Banned Email/Phone
        const bannedUser = allCustomers.find(c => (c.email === email || (phone && c.phone === phone)) && c.isBanned);
        if (bannedUser) {
            return res.status(403).json({ success: false, message: "This account has been banned." });
        }

        if (phone) {
            const phoneExists = allCustomers.find(c => c.phone === phone);
            if (phoneExists) {
                return res.json({ success: false, message: "Phone number already registered" });
            }
        }

        // --- NEW: Generate OTP & Store Temporarily ---
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
        const userData = {
            id: 'usr_' + Date.now().toString(36),
            name: name,
            email: email,
            phone: phone || '',
            dob: req.body.dob || '',
            password: bcrypt.hashSync(password, 10),
            joined: new Date().toISOString(),
            isBanned: false
        };

        // Store in memory (expires in 10 mins)
        pendingUsers[email] = {
            userData,
            otp: otpCode,
            expires: Date.now() + 10 * 60 * 1000,
            attempts: 0
        };

        // Send Email
        await sendOtpEmail(email, otpCode);

        console.log(`[REGISTER-OTP] Sent to ${email} | Code: ${otpCode}`); // Debug Log

        res.json({ success: true, requireVerification: true, email: email, message: "Verification code sent to email" });

    } catch (err) {
        console.error(err);
        return res.json({ success: false, message: "Server error handling registration" });
    }
});

// POST Verify Email (Step 2: Confirm OTP)
router.post('/verify-email', async (req, res) => {
    const { email: rawEmail, otp } = req.body;
    const email = rawEmail ? rawEmail.toLowerCase().trim() : '';

    const record = pendingUsers[email];

    if (!record) {
        return res.status(400).json({ success: false, message: "Invalid or expired verification request. Please register again." });
    }

    if (Date.now() > record.expires) {
        delete pendingUsers[email];
        return res.status(400).json({ success: false, message: "Verification code expired." });
    }

    if (record.otp !== otp.trim()) {
        record.attempts += 1;
        if (record.attempts >= 3) {
            delete pendingUsers[email];
            return res.status(400).json({ success: false, message: "Too many failed attempts. Please register again." });
        }
        return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    // Success! Save user
    try {
        const allCustomers = await readDB('customers.json');

        // Double check duplicate (race condition)
        if (allCustomers.find(c => c.email === email)) {
            return res.status(400).json({ success: false, message: "User already registered." });
        }

        const newUser = { ...record.userData, isVerified: true };
        allCustomers.push(newUser);
        await writeDB('customers.json', allCustomers);

        delete pendingUsers[email];

        // Auto Login
        const { password, ...userWithoutPass } = newUser;
        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, message: "Account verified and created!", user: userWithoutPass, token });

    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json({ success: false, message: "Failed to create account" });
    }
});

// POST Login
router.post('/login', async (req, res) => {
    const { email: rawEmail, password } = req.body;

    if (!rawEmail || !password) {
        return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const email = rawEmail.toLowerCase().trim();

    try {
        const allCustomers = await readDB('customers.json');
        const user = allCustomers.find(c => c.email === email);

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        if (user.isBanned) {
            return res.status(403).json({ success: false, message: "Your account has been banned." });
        }

        // Compare Password
        let isMatch = false;
        if (user.password.startsWith('$2a$')) {
            isMatch = bcrypt.compareSync(password, user.password);
        } else {
            // Legacy plaintext fallback
            isMatch = (user.password === password);
            if (isMatch) {
                // Auto-upgrade to Hash
                user.password = bcrypt.hashSync(password, 10);
                await writeDB('customers.json', allCustomers);
            }
        }

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Generate Token
        // Exclude password
        const { password: _, ...userWithoutPass } = user;
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, user: userWithoutPass, token });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// POST Admin Login
router.post('/admin-login', async (req, res) => {
    const { username, password, token } = req.body;

    const ADMIN_USER = process.env.ADMIN_USER || "kazi@12MW";
    const ADMIN_PASS = process.env.ADMIN_PASS || "emdadul@12MW";
    const MASTER_PIN = process.env.BACKUP_PIN || "105090";

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        // Step 1: Credentials OK. Check 2FA.
        if (!token) {
            return res.json({ success: false, require2fa: true });
        }

        // Step 2: Verify 2FA (TOTP or PIN)
        const systemData = await readDB('system_data.json');

        // Allow Master PIN
        if (token.trim() === MASTER_PIN) {
            const sessionToken = jwt.sign({ id: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
            return res.json({ success: true, token: sessionToken });
        }

        // Verify App Code
        if (systemData && systemData.admin2faSecret) {
            const verified = speakeasy.totp.verify({
                secret: systemData.admin2faSecret,
                encoding: 'base32',
                token: token.trim(),
                window: 2
            });

            if (verified) {
                const sessionToken = jwt.sign({ id: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
                return res.json({ success: true, token: sessionToken });
            }
        } else {
            console.warn("⚠️ Admin 2FA Secret not set! Allowing login with credentials only (Security Risk)");
            // Fallback if no secret set (should not happen based on check)
            const sessionToken = jwt.sign({ id: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
            return res.json({ success: true, token: sessionToken });
        }

        return res.json({ success: false, message: "Invalid 2FA Code" });

    } else {
        res.status(401).json({ success: false, message: "Invalid Admin Credentials" });
    }
});

// POST Change Password
router.post('/change-password', async (req, res) => {
    const { userId, email, oldPass, newPass } = req.body;

    try {
        const allCustomers = await readDB('customers.json');
        const index = allCustomers.findIndex(c => c.id === userId && c.email === email);
        const user = allCustomers[index];

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Verify Old Pass
        const storedPass = user.password;
        let isMatch = false;

        if (storedPass.startsWith('$2a$')) {
            isMatch = bcrypt.compareSync(oldPass, storedPass);
        } else {
            isMatch = (storedPass === oldPass);
        }

        if (!isMatch) {
            return res.json({ success: false, message: "Incorrect current password" });
        }

        // Update Pass
        user.password = bcrypt.hashSync(newPass, 10);
        allCustomers[index] = user;

        await writeDB('customers.json', allCustomers);

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// --- SOCIAL AUTH (Google) ---
async function handleSocialLogin(req, res, provider) {
    const { email, name, photo } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email is required from provider." });
    }

    try {
        const allCustomers = await readDB('customers.json');
        let user = allCustomers.find(c => c.email === email.toLowerCase().trim());

        if (user) {
            console.log(`[SOCIAL LOGIN] Existing user found: ${email}`);
        } else {
            console.log(`[SOCIAL REGISTER] Creating new user: ${email}`);
            // Register new user
            user = {
                id: 'usr_' + Date.now().toString(36),
                name: name || 'User',
                email: email.toLowerCase().trim(),
                phone: '',
                password: '$2a$10$SOCIAL_LOGIN_NO_PASS_' + Date.now(), // Dummy password for social users
                joined: new Date().toISOString(),
                provider: provider,
                photo: photo || ''
            };
            allCustomers.push(user);
            await writeDB('customers.json', allCustomers);
        }

        // Generate Token
        const { password: _, ...userWithoutPass } = user;
        const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, user: userWithoutPass, token });

    } catch (err) {
        console.error("Social Login Error:", err);
        res.status(500).json({ success: false, message: "Server Error during Social Login" });
    }
}

router.post('/auth/google', async (req, res) => {
    await handleSocialLogin(req, res, 'google');
});

module.exports = router;
