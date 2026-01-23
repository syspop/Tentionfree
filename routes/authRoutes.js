const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { writeLocalJSON: writeDB, readLocalJSON: readDB } = require('../data/db');
const speakeasy = require('speakeasy');
const { Buffer } = require('buffer'); // Explicit import for safety
const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

// In-memory challenge store (simplified for single instance)
const challengeStore = {};
const RP_ID = 'tentionfree.store'; // MUST match your domain
const ORIGIN = ['https://tentionfree.store', 'http://localhost:3000', 'http://127.0.0.1:3000'];
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';


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
            dob: req.body.dob || null,
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
    // const MASTER_PIN = process.env.BACKUP_PIN || "105090"; // Not used here

    try {
        if (username === ADMIN_USER && password === ADMIN_PASS) {
            // Step 1: Credentials OK.

            // Step 1: Check if the DEVICE is blocked (using admin_device_id cookie)
            // We use a long-lived cookie 'admin_device_id' to track browsers.
            let deviceId = req.headers.cookie ? req.headers.cookie.split('; ').find(row => row.startsWith('admin_device_id=')) : null;
            if (deviceId) {
                deviceId = deviceId.split('=')[1];
            } else {
                // Generate new Device ID if none exists
                deviceId = require('crypto').randomBytes(16).toString('hex');
            }

            const systemData = await readDB('system_data.json') || {};
            if (!systemData.adminSessions) systemData.adminSessions = {};

            const session = systemData.adminSessions[deviceId];
            if (session && session.isBlocked) {
                return res.status(403).json({ success: false, message: "Access Denied: This device has been blocked by Admin." });
            }

            // Update Session Info (Active)
            systemData.adminSessions[deviceId] = {
                id: deviceId,
                userAgent: req.headers['user-agent'] || 'Unknown',
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                lastLogin: new Date().toISOString(),
                isBlocked: false,
                status: 'Active'
            };
            await writeDB('system_data.json', systemData); // Async save, don't block too long

            // Set/Refresh Cookie (1 Year)
            res.cookie('admin_device_id', deviceId, {
                maxAge: 365 * 24 * 60 * 60 * 1000,
                httpOnly: true, // Secure, JS can't read
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            // Check for Smart 2FA/Passkey Logic
            if (!req.body.loginMethod && !token) {
                // Determine next step based on cookie and available passkeys
                const hasPasskeys = Array.isArray(systemData.adminPasskeys) && systemData.adminPasskeys.length > 0;

                // We check if the "admin_device_registered" cookie was sent
                const isDeviceRegistered = req.headers.cookie && req.headers.cookie.includes('admin_device_registered=true');

                if (hasPasskeys && isDeviceRegistered) {
                    return res.json({ success: false, requirePasskey: true });
                } else {
                    return res.json({ success: false, require2fa: true });
                }
            }

            // Step 2: Verify 2FA (TOTP or PIN or PASSKEY)

            // Check for Passkey Method (WebAuthn) - Handled separately by /auth/webauthn/login-verify
            // BUT if somehow sent here with 'passkey' method, redirect them
            if (req.body.loginMethod === 'passkey') {
                return res.status(400).json({ success: false, message: "Use /auth/webauthn/login-verify for Passkey login" });
            }

            // Verify App Code (TOTP)
            if (systemData && systemData.admin2faSecret) {
                console.log("[AdminLogin] Verifying 2FA...");
                // console.log("[AdminLogin] Secret:", systemData.admin2faSecret); // Security Check
                console.log("[AdminLogin] Input Token:", token.trim());

                const verified = speakeasy.totp.verify({
                    secret: systemData.admin2faSecret,
                    encoding: 'base32',
                    token: token.trim(),
                    window: 10 // Increased to +/- 5 minutes to account for server/client time drift
                });
                console.log("[AdminLogin] Verified Result:", verified);

                if (verified) {
                    const sessionToken = jwt.sign({ id: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
                    return res.json({ success: true, token: sessionToken });
                }

                // Debug Info on Failure
                return res.status(400).json({
                    success: false,
                    message: "Invalid 2FA Code",
                    debug: {
                        serverTime: new Date().toISOString(),
                    }
                });
            } else {
                console.warn("⚠️ Admin 2FA Secret not set! Allowing login with credentials only (Security Risk)");
                const sessionToken = jwt.sign({ id: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
                return res.json({ success: true, token: sessionToken });
            }

            return res.json({ success: false, message: "Invalid 2FA Code" });

        } else {
            res.status(401).json({ success: false, message: "Invalid Admin Credentials" });
        }
    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
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

// --- WEBAUTHN CONFIG ---
// RP_ID and ORIGIN are defined at the top of the file.

// 1. Generate Registration Options (Setup)
router.post('/auth/webauthn/register-options', async (req, res) => {
    const { pin } = req.body;
    const BACKUP_PIN = process.env.BACKUP_PIN || "105090";

    if (pin !== BACKUP_PIN) {
        // If PIN is missing or wrong, maybe check for Admin Token?
        // For now, strict PIN check for this specific endpoint is safer/simpler for bootstrapping.
        // We removed the mandatory Bearer token check because passkey-setup.html only sends PIN.
        return res.status(403).json({ success: false, message: "Invalid Authorization PIN" });
    }

    const systemData = await readDB('system_data.json') || {};
    // Get existing passkeys to prevent duplicates on same device
    const adminPasskeys = Array.isArray(systemData.adminPasskeys) ? systemData.adminPasskeys : [];

    // DYNAMIC RP_ID Logic for Localhost Support
    // If we are on localhost, we MUST use 'localhost' as RP_ID, otherwise 'tentionfree.store'
    let effectiveRpId = RP_ID;
    if (req.get('host').includes('localhost') || req.get('host').includes('127.0.0.1')) {
        effectiveRpId = 'localhost';
        console.log("⚠️ WebAuthn: Using 'localhost' as RP_ID for development.");
    }

    try {
        console.log("[WebAuthn] Register Options Requested. Passkeys:", adminPasskeys.length);

        // Filter out any potential garbage passkeys to prevent crashes
        const validExcludeList = adminPasskeys.filter(pk => pk.id).map(passkey => {
            let id = passkey.id;
            try {
                // Handle legacy format if exists
                if (id && id.type === 'Buffer' && Array.isArray(id.data)) {
                    id = new Uint8Array(id.data);
                } else if (Array.isArray(id)) {
                    // Handle plain array (corrupted save?)
                    id = new Uint8Array(id);
                } else if (typeof id === 'string') {
                    id = base64urlToBuffer(id);
                }
            } catch (bufErr) {
                console.warn("[WebAuthn] Failed to convert passkey ID:", bufErr);
                return null;
            }

            if (!id) return null;

            return {
                id: id,
                transports: passkey.transports,
            };
        }).filter(item => item !== null);

        const options = await generateRegistrationOptions({
            rpName: 'Tention Free Admin',
            rpID: effectiveRpId,
            userID: new Uint8Array(Buffer.from('admin-user-id')),
            userName: 'admin@tentionfree.store',
            attestationType: 'none',
            excludeCredentials: validExcludeList, // Use filtered list
            authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'preferred',
            },
        });

        // Store RP_ID in challenge for verification step
        challengeStore['admin-register'] = { challenge: options.challenge, rpId: effectiveRpId };
        res.json(options);
    } catch (err) {
        console.error("WebAuthn Register Error:", err);
        res.status(500).json({ success: false, message: "Server Error: " + err.message });
    }
});

// 2. Verify Registration (Setup)
router.post('/auth/webauthn/register-verify', async (req, res) => {
    const { response } = req.body;
    const storedData = challengeStore['admin-register'];
    const expectedChallenge = storedData ? storedData.challenge : null;
    const expectedRPID = storedData ? storedData.rpId : RP_ID;

    if (!expectedChallenge) return res.status(400).json({ success: false, message: "Challenge expired" });

    // DEBUG: Log the Origin we are seeing vs what we expect
    const clientOrigin = req.get('origin');
    console.log(`[WebAuthn] Register Verify. Origin: ${clientOrigin} | RP_ID: ${expectedRPID}`);

    try {
        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN, // If this fails, enable the debug log above to see why
            expectedRPID: expectedRPID,
        });

        if (verification.verified && verification.registrationInfo) {
            const systemData = await readDB('system_data.json') || {};
            if (!Array.isArray(systemData.adminPasskeys)) systemData.adminPasskeys = [];

            const regInfo = verification.registrationInfo;
            // console.log("[WebAuthn] Register Info Keys:", Object.keys(regInfo));

            // Compatibility: Handle different versions of simplewebauthn returning slightly different shapes
            let credentialID = regInfo.credentialID;
            let credentialPublicKey = regInfo.credentialPublicKey;

            if (!credentialID && regInfo.credential) {
                credentialID = regInfo.credential.id;
                credentialPublicKey = regInfo.credential.publicKey;
            }

            if (!credentialID) throw new Error("Missing credentialID");
            if (!credentialPublicKey) throw new Error("Missing credentialPublicKey");

            // SAFE CONVERSION: Ensure we store as Base64URL Strings
            const idString = Buffer.isBuffer(credentialID) ?
                Buffer.from(credentialID).toString('base64url') :
                credentialID; // Assume already string if not buffer

            const keyString = Buffer.isBuffer(credentialPublicKey) ?
                Buffer.from(credentialPublicKey).toString('base64url') :
                credentialPublicKey;

            const newValues = {
                id: idString,
                publicKey: keyString,
                counter: regInfo.counter,
                transports: regInfo.credentialTransports,
                device: req.headers['user-agent'] || 'Unknown Device',
                created: new Date().toISOString()
            };

            // Check duplicate ID before pushing
            if (!systemData.adminPasskeys.find(k => k.id === idString)) {
                systemData.adminPasskeys.push(newValues);
                await writeDB('system_data.json', systemData);
            }

            delete challengeStore['admin-register'];

            res.cookie('admin_device_registered', 'true', {
                maxAge: 365 * 24 * 60 * 60 * 1000,
                httpOnly: false
            });

            res.json({ success: true, verified: true });
        } else {
            res.status(400).json({ success: false, verified: false, message: "Verification failed (Signature mismatch)" });
        }
    } catch (error) {
        console.error("WebAuthn Verify Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Generate Login Options
router.get('/auth/webauthn/login-options', async (req, res) => {
    const systemData = await readDB('system_data.json') || {};
    const adminPasskeys = systemData.adminPasskeys || [];

    if (adminPasskeys.length === 0) {
        return res.status(400).json({ success: false, message: "No Passkeys Registered" });
    }

    // DYNAMIC RP_ID Logic for Localhost Support
    let effectiveRpId = RP_ID;
    if (req.get('host').includes('localhost') || req.get('host').includes('127.0.0.1')) {
        effectiveRpId = 'localhost';
    }

    try {
        const options = await generateAuthenticationOptions({
            rpID: effectiveRpId,
            // simplewebauthn v13: allowCredentials.id can be Base64URL String or Uint8Array.
            // Using Base64URL String is safer against internal "input.replace" crashes if the library tries to stringify it.
            allowCredentials: adminPasskeys.map(key => {
                let id = key.id;
                // If stored as Buffer Object in JSON
                if (id && id.type === 'Buffer') {
                    return {
                        id: Buffer.from(id.data).toString('base64url'),
                        type: 'public-key',
                        transports: key.transports,
                    };
                }
                // If stored as Array
                if (Array.isArray(id)) {
                    return {
                        id: Buffer.from(id).toString('base64url'),
                        type: 'public-key',
                        transports: key.transports,
                    };
                }
                // If stored as String (Base64URL already)
                if (typeof id === 'string') {
                    return {
                        id: id,
                        type: 'public-key',
                        transports: key.transports,
                    };
                }
                return null;
            }).filter(c => c !== null),
            userVerification: 'preferred',
        });

        challengeStore['admin-login'] = { challenge: options.challenge, rpId: effectiveRpId };
        res.json(options);
    } catch (err) {
        console.error("WebAuthn Login Options Error:", err);
        res.status(500).json({ success: false, message: "Options Error: " + err.message + (err.stack ? " | " + err.stack.split('\n')[1] : "") });
    }
});

// 4. Verify Login
router.post('/auth/webauthn/login-verify', async (req, res) => {
    const { response } = req.body;
    const storedData = challengeStore['admin-login'];
    const expectedChallenge = storedData ? storedData.challenge : null;
    const expectedRPID = storedData ? storedData.rpId : RP_ID;

    if (!expectedChallenge) return res.status(400).json({ success: false, message: "Challenge expired" });

    // DEBUG LOG
    const clientOrigin = req.get('origin');
    console.log(`[WebAuthn] Login Verify. Origin: ${clientOrigin}, Cred ID: ${response.id}`);

    try {
        const systemData = await readDB('system_data.json') || {};
        const adminPasskeys = systemData.adminPasskeys || [];

        const credentialID = response.id; // Base64URL String from client

        // Robust matching
        const dbAuthenticator = adminPasskeys.find(key => {
            // Case 1: Stored as String
            if (typeof key.id === 'string') {
                return key.id === credentialID;
            }
            // Case 2: Stored as Buffer object
            if (key.id && key.id.type === 'Buffer') {
                const buf = Buffer.from(key.id.data);
                return base64urlToBuffer(credentialID).equals(buf);
            }
            return false;
        });

        if (!dbAuthenticator) {
            console.error(`[WebAuthn] Credential ID ${credentialID} not found in DB.`);
            console.log("Known IDs:", adminPasskeys.map(k => typeof k.id === 'string' ? k.id.substring(0, 10) + '...' : 'Buffer'));
            return res.status(400).json({ success: false, message: "Authenticator not recognized. Please re-register it." });
        }

        // Prepare Public Key and ID for verification function
        let storedPublicKey = dbAuthenticator.publicKey;
        if (typeof storedPublicKey === 'string') storedPublicKey = base64urlToBuffer(storedPublicKey);
        else if (storedPublicKey.type === 'Buffer') storedPublicKey = Buffer.from(storedPublicKey.data);

        let storedCredentialID = dbAuthenticator.id;
        if (typeof storedCredentialID === 'string') storedCredentialID = base64urlToBuffer(storedCredentialID);
        else if (storedCredentialID.type === 'Buffer') storedCredentialID = Buffer.from(storedCredentialID.data);

        // Debug Inputs
        console.log("[WebAuthn] Verify Inputs:", {
            responseIdType: typeof response.id,
            responseClientDataType: typeof response.clientDataJSON,
            responseAuthDataType: typeof response.authenticatorData,
            storedIdType: Buffer.isBuffer(storedCredentialID) ? 'Buffer' : typeof storedCredentialID,
            storedKeyType: Buffer.isBuffer(storedPublicKey) ? 'Buffer' : typeof storedPublicKey
        });

        console.log("[WebAuthn] dbAuthenticator (Found):", JSON.stringify(dbAuthenticator)); // DEBUG LOG

        // Guard: Ensure Valid Inputs
        if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

        // Fix: simplewebauthn v13 often implies Base64URL string for IDs if it crashes on Buffers with input.replace
        // We convert to Base64URL String explicitly.
        let finalCredentialID = storedCredentialID;
        if (Buffer.isBuffer(finalCredentialID) || finalCredentialID instanceof Uint8Array) {
            finalCredentialID = Buffer.from(finalCredentialID).toString('base64url');
        } else if (typeof finalCredentialID !== 'string') {
            console.warn("[WebAuthn] Unknown CredentialID type:", typeof finalCredentialID);
            finalCredentialID = String(finalCredentialID);
        }

        // Public Key -> Buffer/Uint8Array
        let finalPublicKey = storedPublicKey;
        if (!Buffer.isBuffer(finalPublicKey) && !(finalPublicKey instanceof Uint8Array)) {
            // Handle { "0": 123, "1": 45 ... } object structure from JSON
            if (typeof finalPublicKey === 'object' && finalPublicKey !== null) {
                // Convert object values to array, then buffer
                // We assume keys are "0", "1", etc. and Object.values returns them in order for simple numeric keys
                // Ideally we should start with a clean buffer based on Object.keys length if we want to be 100% safe,
                // but Object.values() is generally standard for this JSON output.
                const vals = Object.values(finalPublicKey);
                if (vals.length > 0 && typeof vals[0] === 'number') {
                    finalPublicKey = Buffer.from(vals);
                }
            }
        }
        // Fallback or ensure it's typed
        if (!Buffer.isBuffer(finalPublicKey)) {
            finalPublicKey = new Uint8Array(finalPublicKey);
        }

        // Sanitize Response Inputs (ensure strings)
        if (typeof response.clientDataJSON !== 'string') {
            console.warn("[WebAuthn] Sanitizing clientDataJSON (was " + typeof response.clientDataJSON + ")");
            response.clientDataJSON = String(response.clientDataJSON || '');
        }
        if (typeof response.authenticatorData !== 'string') {
            console.warn("[WebAuthn] Sanitizing authenticatorData (was " + typeof response.authenticatorData + ")");
            response.authenticatorData = String(response.authenticatorData || '');
        }
        if (typeof response.signature !== 'string') {
            console.warn("[WebAuthn] Sanitizing signature (was " + typeof response.signature + ")");
            response.signature = String(response.signature || '');
        }
        // response.userHandle is optional

        const authenticatorObj = {
            credentialID: finalCredentialID, // Passed as String
            credentialPublicKey: finalPublicKey,
            counter: parseInt(dbAuthenticator.counter || 0),
            transports: dbAuthenticator.transports,
        };
        // console.log("[WebAuthn] Constructed Authenticator:", authenticatorObj); // Reduced Log

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: expectedRPID,
            authenticator: authenticatorObj
        });

        if (verification.verified) {
            // Update counter
            dbAuthenticator.counter = verification.authenticationInfo.newCounter;
            dbAuthenticator.lastUsed = new Date().toISOString();
            await writeDB('system_data.json', systemData);

            delete challengeStore['admin-login'];

            const sessionToken = jwt.sign({ id: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ success: true, verified: true, token: sessionToken });
        } else {
            console.warn("[WebAuthn] Verification failed logic returned false.");
            res.status(400).json({ success: false, verified: false });
        }
    } catch (error) {
        console.error("LOGIN-VERIFY-CRASH:", error);
        if (error.stack) console.error(error.stack); // PRINT STACK

        // Re-construct Debug Info
        const errDebug = {
            msg: error.message,
            stackTop: error.stack ? error.stack.split('\n')[1] : 'No Stack',
            hint: "Check server logs"
        };

        res.status(500).json({
            success: false,
            message: "Verify Error: " + error.message,
            debug: errDebug
        });
    }
});

// Helper for Base64URL to Buffer (Safe version)
function base64urlToBuffer(base64url) {
    if (typeof base64url !== 'string') {
        console.warn("base64urlToBuffer received non-string:", typeof base64url, base64url);
        return Buffer.from([]);
    }
    const padding = '='.repeat((4 - base64url.length % 4) % 4);
    const base64 = (base64url + padding).replace(/\-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64');
}

// --- PASSKEY MANAGEMENT ---

// GET List of Registered Devices
router.get('/auth/webauthn/list', async (req, res) => {
    // Auth Check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
    } catch {
        return res.status(403).json({ success: false, message: "Invalid Token" });
    }

    const systemData = await readDB('system_data.json') || {};
    const adminPasskeys = systemData.adminPasskeys || [];

    // Return safe data (no public keys needed for list)
    const list = adminPasskeys.map(pk => ({
        id: typeof pk.id === 'string' ? pk.id : 'Legacy-ID', // Should be string now
        device: pk.device || 'Unknown',
        created: pk.created || 'Unknown Date',
        lastUsed: pk.lastUsed || 'Never'
    }));

    res.json({ success: true, devices: list });
});

// DELETE Remove a Device
router.delete('/auth/webauthn/delete/:id', async (req, res) => {
    // Auth Check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
    } catch {
        return res.status(403).json({ success: false, message: "Invalid Token" });
    }

    const targetId = req.params.id;
    const systemData = await readDB('system_data.json') || {};
    let adminPasskeys = systemData.adminPasskeys || [];

    const initialLength = adminPasskeys.length;

    // Filter out the target ID
    adminPasskeys = adminPasskeys.filter(pk => {
        const pkId = typeof pk.id === 'string' ? pk.id : Buffer.from(pk.id.data).toString('base64url');
        return pkId !== targetId;
    });

    if (adminPasskeys.length === initialLength) {
        return res.status(404).json({ success: false, message: "Device not found" });
    }

    systemData.adminPasskeys = adminPasskeys;
    await writeDB('system_data.json', systemData);

    res.json({ success: true, message: "Device Removed" });
});

// --- ADMIN SECURITY SETTINGS ---

// Update Authorization PIN
router.post('/auth/admin/update-pin', async (req, res) => {
    // Auth Check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, message: "Unauthorized" });
    const token = authHeader.split(' ')[1];

    try {
        jwt.verify(token, JWT_SECRET);
    } catch {
        return res.status(403).json({ success: false, message: "Invalid Token" });
    }

    const { newPin, twoFaCode } = req.body;

    if (!newPin || newPin.length < 4) return res.status(400).json({ success: false, message: "PIN must be at least 4 digits" });
    if (!twoFaCode) return res.status(400).json({ success: false, message: "2FA Code Required" });

    // Verify 2FA
    const systemData = await readDB('system_data.json') || {};
    if (!systemData.admin2faSecret) return res.status(400).json({ success: false, message: "2FA not set up. Cannot change PIN." });

    const verified = speakeasy.totp.verify({
        secret: systemData.admin2faSecret,
        encoding: 'base32',
        token: twoFaCode.trim(),
        window: 2
    });

    if (!verified) return res.status(400).json({ success: false, message: "Invalid 2FA Code" });

    // Update PIN
    systemData.backupPin = newPin;
    await writeDB('system_data.json', systemData);

    // Also update env var in memory if possible, but process.env is read-only usually. 
    // We will update the REGISTER route to check systemData.backupPin FIRST.

    res.json({ success: true, message: "Authorization PIN Updated" });
});


// Setup / Reset 2FA
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// --- DEVICE MANAGEMENT API ---

// GET All Sessions (Devices)
router.get('/auth/admin/devices', async (req, res) => {
    // Auth Check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, message: "Unauthorized" });
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
    } catch {
        return res.status(403).json({ success: false, message: "Invalid Token" });
    }

    const systemData = await readDB('system_data.json') || {};
    const sessions = systemData.adminSessions || {};

    // Convert Object to Array
    const sessionList = Object.values(sessions).sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin));

    res.json({ success: true, devices: sessionList });
});

// POST Toggle Block Device
router.post('/auth/admin/devices/toggle-block', async (req, res) => {
    // Auth Check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, message: "Unauthorized" });
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
    } catch {
        return res.status(403).json({ success: false, message: "Invalid Token" });
    }

    const { deviceId, block } = req.body; // block = true/false

    // CHECK SELF-BLOCK: Prevent blocking the current session
    let currentDeviceId = req.headers.cookie ? req.headers.cookie.split('; ').find(row => row.startsWith('admin_device_id=')) : null;
    if (currentDeviceId) currentDeviceId = currentDeviceId.split('=')[1];

    if (block && currentDeviceId && currentDeviceId === deviceId) {
        return res.status(400).json({ success: false, message: "Safety Block: You cannot block your own current device!" });
    }

    const systemData = await readDB('system_data.json') || {};
    if (!systemData.adminSessions) systemData.adminSessions = {};

    if (!systemData.adminSessions[deviceId]) {
        return res.status(404).json({ success: false, message: "Device not found" });
    }

    systemData.adminSessions[deviceId].isBlocked = block;
    systemData.adminSessions[deviceId].status = block ? 'Blocked' : 'Active';

    await writeDB('system_data.json', systemData);

    res.json({ success: true, message: `Device ${block ? 'Blocked' : 'Unblocked'}` });
});


router.post('/auth/admin/setup-2fa', async (req, res) => {
    // Auth Check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, message: "Unauthorized" });
    const token = authHeader.split(' ')[1];

    try {
        jwt.verify(token, JWT_SECRET);
    } catch {
        return res.status(403).json({ success: false, message: "Invalid Token" });
    }

    const { pin } = req.body;
    const systemData = await readDB('system_data.json') || {};
    const CURRENT_PIN = systemData.backupPin || process.env.BACKUP_PIN || "105090";

    if (pin !== CURRENT_PIN) {
        return res.status(403).json({ success: false, message: "Invalid Authorization PIN" });
    }

    // Generate New Secret
    const secret = speakeasy.generateSecret({ name: "TentionFree Admin" });

    // Generate QR
    try {
        const qrDataURL = await QRCode.toDataURL(secret.otpauth_url);
        let savedPath = "Not Saved (Server Side)";

        // Try to save to Desktop (Only works if running locally)
        try {
            const isWindows = process.platform === 'win32';
            if (isWindows) {
                const desktopPath = path.join(require('os').homedir(), 'OneDrive - hlwz', 'Desktop', '2FA_QR_CODES');

                // Fallback attempt logic
                if (!fs.existsSync(desktopPath)) {
                    // Check if base exists
                    if (fs.existsSync(path.join(require('os').homedir(), 'OneDrive - hlwz'))) {
                        fs.mkdirSync(desktopPath, { recursive: true });
                    } else {
                        // Fallback to standard Desktop
                        const stdPath = path.join(require('os').homedir(), 'Desktop', '2FA_QR_CODES');
                        fs.mkdirSync(stdPath, { recursive: true });
                    }
                }

                // Try saving if any path logic worked above
                const targetDir = fs.existsSync(desktopPath) ? desktopPath : path.join(require('os').homedir(), 'Desktop', '2FA_QR_CODES');

                if (fs.existsSync(targetDir)) {
                    const filename = `Admin_2FA_${Date.now()}.png`;
                    const filePath = path.join(targetDir, filename);
                    const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, "");
                    fs.writeFileSync(filePath, base64Data, 'base64');
                    savedPath = filePath;
                    console.log("QR Local Save Success:", filePath);
                }
            }
        } catch (saveErr) {
            console.warn("Could not save QR to local filesystem (ignoring):", saveErr.message);
        }

        // Save SECRET to DB
        systemData.admin2faSecret = secret.base32;
        await writeDB('system_data.json', systemData);

        res.json({ success: true, message: "2FA Reset. Scan QR.", qr: qrDataURL, savedPath: savedPath });

    } catch (err) {
        console.error("2FA Setup Error:", err);
        res.status(500).json({ success: false, message: "Failed to generate 2FA" });
    }
});

module.exports = router;
