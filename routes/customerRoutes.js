const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { writeLocalJSON: writeDB, readLocalJSON: readDB } = require('../data/db');
const { authenticateAdmin, authenticateUser } = require('../middleware/auth');

// GET Customers (Admin only)
router.get('/customers', authenticateAdmin, async (req, res) => {
    try {
        const customers = await readDB('customers.json');
        let needsSave = false;

        // Auto-fix legacy Google users
        customers.forEach(c => {
            if (c.provider === 'google' && !c.isVerified) {
                c.isVerified = true;
                needsSave = true;
                console.log(`[AUTO-FIX] Verified legacy Google user: ${c.email}`);
            }
        });

        if (needsSave) {
            await writeDB('customers.json', customers);
        }

        const safeCustomers = customers.map(c => {
            const { password, ...rest } = c;
            return rest;
        });

        res.json(safeCustomers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read customers' });
    }
});

// GET My Profile (User)
router.get('/my-profile', authenticateUser, async (req, res) => {
    const userId = req.user.id;
    try {
        const customers = await readDB('customers.json');
        const user = customers.find(c => c.id === userId);

        if (user) {
            if (user.provider === 'google' && !user.isVerified) {
                user.isVerified = true;
                await writeDB('customers.json', customers);
                console.log(`[AUTO-FIX] Verified legacy Google user (Profile): ${user.email}`);
            }

            const { password, ...safeUser } = user;
            res.json(safeUser);
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// UPDATE Customer (Admin OR User Self-Update)
router.put('/customers/:id', authenticateUser, async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const isAdmin = req.user.role === 'admin';

    if (req.user.id !== id && !isAdmin) {
        return res.status(403).json({ success: false, message: "Unauthorized Update" });
    }

    try {
        const allCustomers = await readDB('customers.json');
        const index = allCustomers.findIndex(c => c.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const user = allCustomers[index];

        if (updates.email && updates.email !== user.email) {
            const exists = allCustomers.find(c => c.email === updates.email && c.id !== id);
            if (exists) return res.status(400).json({ success: false, message: "Email already taken" });
        }
        if (updates.phone && updates.phone !== user.phone) {
            const exists = allCustomers.find(c => c.phone === updates.phone && c.id !== id);
            if (exists) return res.status(400).json({ success: false, message: "Phone already taken" });
        }

        const allowedFields = ['name', 'email', 'phone', 'dob', 'password']; // Removed 'photo' due to schema mismatch
        if (isAdmin) allowedFields.push('isBanned', 'role', 'joined', 'provider');

        const safeUpdates = {};
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key) && value !== undefined) {
                // Sanitize Date
                if (key === 'dob' && value === '') {
                    safeUpdates[key] = null;
                } else {
                    safeUpdates[key] = value;
                }
            }
        }

        if (safeUpdates.password) {
            if (!safeUpdates.password.startsWith('$2a$') && safeUpdates.password.length > 0) {
                safeUpdates.password = bcrypt.hashSync(safeUpdates.password, 10);
            } else if (safeUpdates.password.length === 0) {
                delete safeUpdates.password;
            }
        }

        allCustomers[index] = { ...user, ...safeUpdates };
        await writeDB('customers.json', allCustomers);

        const { password, ...userWithoutPass } = allCustomers[index];
        res.json({ success: true, message: "Customer updated", user: userWithoutPass });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Save Error", error: err.message, details: err });
    }
});

// DELETE Customer
router.delete('/customers/:id', async (req, res) => {
    const userId = req.params.id.trim();
    const { password, isAdmin } = req.body;

    try {
        let allCustomers = await readDB('customers.json');
        const userIndex = allCustomers.findIndex(c => c.id === userId);
        const user = allCustomers[userIndex];

        if (!user) {
            return res.status(404).json({ success: false, message: `User not found (ID: ${userId})` });
        }

        const ADMIN_PASS = process.env.ADMIN_PASS;

        if (isAdmin) {
            if (password !== ADMIN_PASS) {
                return res.json({ success: false, message: "Incorrect Admin Password" });
            }
        } else {
            const storedPass = user.password;
            let isMatch = false;

            if (storedPass.startsWith('$2a$')) {
                isMatch = bcrypt.compareSync(password, storedPass);
            } else {
                isMatch = (storedPass === password);
            }

            if (!isMatch) {
                return res.json({ success: false, message: "Incorrect Password" });
            }
        }

        allCustomers.splice(userIndex, 1);
        await writeDB('customers.json', allCustomers);

        res.json({ success: true, message: "Account deleted successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "DB Error" });
    }
});

// Ban/Unban Customer
router.put('/customers/:id/ban', authenticateAdmin, async (req, res) => {
    const id = req.params.id;
    const { isBanned } = req.body;

    try {
        const customers = await readDB('customers.json');
        const index = customers.findIndex(c => c.id === id);
        if (index === -1) return res.status(404).json({ error: "Customer not found" });

        customers[index].isBanned = isBanned;
        await writeDB('customers.json', customers);

        res.json({ success: true, isBanned: customers[index].isBanned });
    } catch (err) {
        res.status(500).json({ error: "Failed to update ban status" });
    }
});

module.exports = router;
