const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load env vars
const bcrypt = require('bcryptjs'); // Password Hashing
const jwt = require('jsonwebtoken'); // JWT for API Security
const { connectMongoDB, syncCollection } = require('./mongoBackup'); // Backup Service

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Backup
connectMongoDB();
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');

const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// Middleware
// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Automatic Redirect: .html -> clean URL
// Automatic Redirect: .html -> clean URL
app.use((req, res, next) => {
    if (req.path === '/index' || req.path === '/index.html') {
        const qIndex = req.url.indexOf('?');
        const query = qIndex >= 0 ? req.url.slice(qIndex) : '';
        return res.redirect(301, '/' + query);
    }
    if (req.path.endsWith('.html')) {
        const newPath = req.path.slice(0, -5);
        const qIndex = req.url.indexOf('?');
        const query = qIndex >= 0 ? req.url.slice(qIndex) : '';
        return res.redirect(301, newPath + query);
    }
    next();
});

// Serve static files (try .html automatically)
app.use(express.static(__dirname, { extensions: ['html', 'htm'] }));

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

// --- SECURITY MIDDLEWARE ---
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Access Denied: Invalid Token" });
        if (user.role !== 'admin') return res.status(403).json({ success: false, message: "Access Denied: Admins Only" });
        req.user = user;
        next();
    });
};

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Access Denied: Invalid Token" });
        req.user = user;
        next();
    });
};

// API Routes

// --- PRODUCTS ---
// GET Products
app.get('/api/products', (req, res) => {
    fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
        if (err) {
            // If file doesn't exist, return empty array
            if (err.code === 'ENOENT') return res.json([]);
            console.error(err);
            return res.status(500).json({ error: 'Failed to read products' });
        }
        res.json(JSON.parse(data));
    });
});

// POST Products (Overwrite all) - PROTECTED
app.post('/api/products', authenticateAdmin, (req, res) => {
    const products = req.body;
    fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 4), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to save products' });
        }
        // Backup to MongoDB
        syncCollection('products', products);

        res.json({ message: 'Products saved successfully' });
    });
});

// --- ORDERS ---
// GET Orders - PROTECTED
app.get('/api/orders', authenticateAdmin, (req, res) => {
    fs.readFile(ORDERS_FILE, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') return res.json([]);
            console.error(err);
            return res.status(500).json({ error: 'Failed to read orders' });
        }
        try {
            res.json(JSON.parse(data));
        } catch (e) {
            res.json([]); // Return empty if file corrupted/empty
        }
    });
});

// POST Order (Add NEW Order from Checkout)
app.post('/api/orders', (req, res) => {
    const newOrder = req.body;

    // Read existing
    fs.readFile(ORDERS_FILE, 'utf8', (err, data) => {
        let orders = [];
        if (!err && data) {
            try {
                orders = JSON.parse(data);
            } catch (e) { console.error("Error parsing existing orders", e); }
        }

        orders.push(newOrder);

        // Save back
        fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 4), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, error: 'Failed to save order' });
            }
            // Backup to MongoDB
            syncCollection('orders', orders);

            res.json({ success: true, message: 'Order created successfully', orderId: newOrder.id });
        });
    });
});

// PUT Orders (Overwrite ALL - for Admin updates/deletes) - PROTECTED
app.put('/api/orders', authenticateAdmin, (req, res) => {
    const orders = req.body;
    fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 4), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Failed to update orders' });
        }
        // Backup to MongoDB
        syncCollection('orders', orders);

        res.json({ success: true, message: 'Orders updated successfully' });
    });
});

// GET My Orders (User) - PROTECTED
app.get('/api/my-orders', authenticateUser, (req, res) => {
    const userEmail = req.user.email.toLowerCase().trim();

    fs.readFile(ORDERS_FILE, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') return res.json([]);
            return res.status(500).json({ error: 'Failed to read orders' });
        }
        try {
            const allOrders = JSON.parse(data);
            const myOrders = allOrders.filter(o =>
                (o.email && o.email.toLowerCase().trim() === userEmail)
            );
            res.json(myOrders);
        } catch (e) {
            res.json([]);
        }
    });
});

// --- TICKETS (Support) ---
const TICKETS_FILE = path.join(__dirname, 'data', 'tickets.json');

// GET Tickets (Admin) - PROTECTED
app.get('/api/tickets', authenticateAdmin, (req, res) => {
    console.log("GET /api/tickets requested");
    console.log("Reading tickets from:", TICKETS_FILE);

    fs.readFile(TICKETS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading tickets file:", err);
            if (err.code === 'ENOENT') {
                console.log("Tickets file not found, returning empty.");
                return res.json([]);
            }
            return res.status(500).json({ error: 'Failed to read tickets' });
        }
        try {
            const tickets = JSON.parse(data);
            console.log(`Successfully read ${tickets.length} tickets.`);
            res.json(tickets);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            res.json([]);
        }
    });
});

// POST Ticket (User)
app.post('/api/tickets', (req, res) => {
    console.log("POST /api/tickets received");
    const { userId, userName, email, subject, desc, image } = req.body;
    console.log("Payload:", { userId, userName, email, subject });

    if (!userId || !desc) {
        console.error("Missing required fields");
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    fs.readFile(TICKETS_FILE, 'utf8', (err, data) => {
        let tickets = [];
        if (!err && data) {
            try { tickets = JSON.parse(data); } catch (e) { }
        }

        const newTicket = {
            id: Date.now(),
            userId, userName, email, subject, desc, image,
            date: new Date().toLocaleString()
        };

        tickets.push(newTicket);

        fs.writeFile(TICKETS_FILE, JSON.stringify(tickets, null, 4), 'utf8', (err) => {
            if (err) {
                console.error("Error writing ticket file:", err);
                return res.status(500).json({ success: false });
            }
            // Backup to MongoDB
            syncCollection('tickets', tickets);

            console.log("Ticket saved successfully. Total count:", tickets.length);
            res.json({ success: true, message: 'Ticket submitted' });
        });
    });
});

// DELETE Ticket (Admin) - PROTECTED
app.delete('/api/tickets/:id', authenticateAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    fs.readFile(TICKETS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ success: false });

        let tickets = JSON.parse(data);
        const filtered = tickets.filter(t => t.id !== id);

        fs.writeFile(TICKETS_FILE, JSON.stringify(filtered, null, 4), 'utf8', (err) => {
            if (err) return res.status(500).json({ success: false });

            // Backup to MongoDB
            syncCollection('tickets', filtered);

            res.json({ success: true });
        });
    });
});

// DELETE Ticket (Solve)
app.delete('/api/tickets/:id', (req, res) => {
    const id = parseInt(req.params.id);
    fs.readFile(TICKETS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ success: false });

        let tickets = JSON.parse(data);
        const filtered = tickets.filter(t => t.id !== id);

        fs.writeFile(TICKETS_FILE, JSON.stringify(filtered, null, 4), 'utf8', (err) => {
            if (err) return res.status(500).json({ success: false });

            // Backup to MongoDB
            syncCollection('tickets', filtered);

            res.json({ success: true });
        });
    });
});

// --- AUTHENTICATION ---
const CUSTOMERS_FILE = path.join(__dirname, 'data', 'customers.json');

// Helper to get customers
function getCustomers() {
    try {
        if (!fs.existsSync(CUSTOMERS_FILE)) return [];
        const data = fs.readFileSync(CUSTOMERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading customers:", err);
        return [];
    }
}

// GET Customers (Admin only ideally, but public for this MVP as per request) - SECURED NOW
app.get('/api/customers', authenticateAdmin, (req, res) => {
    const customers = getCustomers();
    // Return safe data (exclude passwords if necessary, but here likely okay or strip them)
    // Let's strip passwords to be safe
    const safeCustomers = customers.map(c => {
        const { password, ...rest } = c;
        return rest;
    });
    res.json(safeCustomers);
});

// PUT Update Customer (Admin) - PROTECTED
// GET My Profile (User) - PROTECTED
app.get('/api/my-profile', authenticateUser, (req, res) => {
    const userId = req.user.id;
    const customers = getCustomers();
    const user = customers.find(c => c.id === userId);

    if (user) {
        const { password, ...userWithoutPass } = user;
        res.json(userWithoutPass);
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
});

// PUT Update Customer (Admin OR User Self-Update)
app.put('/api/customers/:id', (req, res) => {
    const id = req.params.id;
    const { name, email, phone, password, dob } = req.body;
    let isSelfUpdate = false;

    // Check for Authorization Header (User Token)
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            // Check if user is updating THEIR OWN profile
            if (decoded.id === id) {
                isSelfUpdate = true;
            } else if (decoded.role === 'admin') {
                isSelfUpdate = true; // Admins can update anyone
            }
        } catch (e) { /* Invalid token, proceed to check legacy/admin */ }
    }

    // IF not verified by token, we fallback to our previous protection (authenticateAdmin)
    // But since I removed authenticateAdmin from the route definition, I must enforce it here if not self-update.
    if (!isSelfUpdate) {
        // Since we don't have user tokens fully integrated in frontend yet, 
        // we might blocking valid updates if we are too strict.
        // BUT for "Secure" implementation, we should block.
        // However, I removed 'authenticateAdmin' from app.put to allow this custom logic.
        // If not self-update, we DENY.

        // Wait! The user currently has NO token in frontend. So isSelfUpdate will be false.
        // So this will BREAK user updates until frontend sends token.
        // Correct behavior: This API expects a token now. Frontend MUST send it.
        return res.status(401).json({ success: false, message: "Unauthorized Update" });
    }

    fs.readFile(CUSTOMERS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ success: false, message: "Server Error" });

        let customers = JSON.parse(data);
        const index = customers.findIndex(c => c.id === id);

        if (index === -1) {
            return res.json({ success: false, message: "User not found" });
        }

        // Check email uniqueness if changed
        if (email && email !== customers[index].email) {
            if (customers.find(c => c.email === email && c.id !== id)) {
                return res.json({ success: false, message: "Email already taken" });
            }
        }
        // Check phone uniqueness if changed
        if (phone && phone !== customers[index].phone) {
            if (customers.find(c => c.phone === phone && c.id !== id)) {
                return res.json({ success: false, message: "Phone already taken" });
            }
        }

        // Update fields
        if (name) customers[index].name = name;
        if (email) customers[index].email = email;
        if (phone !== undefined) customers[index].phone = phone;
        if (dob !== undefined) customers[index].dob = dob;
        if (password) customers[index].password = password;

        fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 4), 'utf8', (e) => {
            if (e) return res.status(500).json({ success: false, message: "Save Error" });

            // Backup to MongoDB
            syncCollection('customers', customers);

            res.json({ success: true, message: "Customer updated" });
        });
    });
});

// DELETE Customer (Admin/User)
// DELETE Customer (Secure)
app.delete('/api/customers/:id', (req, res) => {
    const userId = req.params.id.trim();
    // Use express.json() middleware to ensure body is parsed
    const { password, isAdmin } = req.body;

    fs.readFile(CUSTOMERS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ success: false, message: "DB Error" });

        let customers = [];
        try { customers = JSON.parse(data); } catch (e) { }

        const index = customers.findIndex(c => c.id === userId);

        if (index === -1) {
            return res.status(404).json({ success: false, message: `User not found (ID: ${userId})` });
        }

        // Security Check
        const ADMIN_PASS = process.env.ADMIN_PASS || "asy-sala";

        if (isAdmin) {
            if (password !== ADMIN_PASS) {
                return res.json({ success: false, message: "Incorrect Admin Password" });
            }
        } else {
            // User deleting their own account (Check Hash or Plaintext)
            const storedPass = customers[index].password;
            let isMatch = false;

            // 1. Try bcrypt compare
            if (storedPass.startsWith('$2a$')) {
                isMatch = bcrypt.compareSync(password, storedPass);
            } else {
                // 2. Fallback to Plaintext
                isMatch = (storedPass === password);
            }

            if (!isMatch) {
                return res.json({ success: false, message: "Incorrect Password" });
            }
        }

        customers.splice(index, 1);

        fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 4), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.json({ success: false, message: "DB Error" });
            }
            // Backup to MongoDB
            syncCollection('customers', customers);

            res.json({ success: true, message: "Account deleted successfully" });
        });
    });
});

// POST Change Password
app.post('/api/change-password', (req, res) => {
    const { userId, email, oldPass, newPass } = req.body;

    fs.readFile(CUSTOMERS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ success: false, message: "Server Error" });

        // Use full list, including passwords
        let customers = JSON.parse(data);
        const index = customers.findIndex(c => c.id === userId && c.email === email);

        if (index === -1) {
            return res.json({ success: false, message: "User not found" });
        }

        // Verify Old Pass (Hash or Plain)
        const storedPass = customers[index].password;
        let isMatch = false;

        if (storedPass.startsWith('$2a$')) {
            isMatch = bcrypt.compareSync(oldPass, storedPass);
        } else {
            isMatch = (storedPass === oldPass);
        }

        if (!isMatch) {
            return res.json({ success: false, message: "Incorrect current password" });
        }

        // Update Pass (Hash new one)
        customers[index].password = bcrypt.hashSync(newPass, 10);

        fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 4), 'utf8', (e) => {
            if (e) return res.status(500).json({ success: false, message: "Save Error" });

            // Backup to MongoDB
            syncCollection('customers', customers);

            res.json({ success: true });
        });
    });
});

// POST Register
app.post('/api/register', (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing required fields" });
    }

    const customers = getCustomers();

    // Check duplicate
    if (customers.find(c => c.email === email)) {
        return res.json({ success: false, message: "Email already registered" });
    }
    if (phone && customers.find(c => c.phone === phone)) {
        return res.json({ success: false, message: "Phone number already registered" });
    }

    const newCustomer = {
        id: 'usr_' + Date.now().toString(36),
        name: name,
        email: email,
        phone: phone || '',
        dob: req.body.dob || '', // Store DOB
        password: bcrypt.hashSync(password, 10), // Hash Password!
        joined: new Date().toISOString()
    };

    customers.push(newCustomer);

    fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 4), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: "Server error saving user" });
        }

        // Backup to MongoDB
        syncCollection('customers', customers);

        // Return without password
        const { password, ...userWithoutPass } = newCustomer;

        // Generate Token
        const token = jwt.sign({ id: newCustomer.id, email: newCustomer.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, user: userWithoutPass, token });
    });
});

// POST Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const customers = getCustomers();

    const index = customers.findIndex(c => c.email === email);
    const user = customers[index];

    if (user) {
        let isMatch = false;
        let needsUpgrade = false;

        // 1. Check Hash
        if (user.password.startsWith('$2a$')) {
            isMatch = bcrypt.compareSync(password, user.password);
        } else {
            // 2. Check Plaintext (Legacy)
            if (user.password === password) {
                isMatch = true;
                needsUpgrade = true; // Flag to upgrade this user
            }
        }

        if (isMatch) {
            // Lazy Migration: If plain text matched, upgrade to hash NOW
            if (needsUpgrade) {
                customers[index].password = bcrypt.hashSync(password, 10);
                fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 4), 'utf8');
                syncCollection('customers', customers); // Backup
                console.log(`Security Upgrade: User ${user.email} migrated to hashed password.`);
            }

            const { password, ...userWithoutPass } = customers[index]; // Return fresh data

            // Generate Token
            const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

            res.json({ success: true, user: userWithoutPass, token });
        } else {
            res.json({ success: false, message: "Invalid email or password" });
        }
    } else {
        res.json({ success: false, message: "Invalid email or password" });
    }
});

// POST Admin Login
app.post('/api/admin-login', (req, res) => {
    const { user, pass } = req.body;

    // Environment Variables
    const ADMIN_USER = process.env.ADMIN_USER || "sai-sad";
    const ADMIN_PASS = process.env.ADMIN_PASS || "asy-sala";

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        // Generate Token
        const token = jwt.sign({ user: ADMIN_USER, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token });
    } else {
        res.json({ success: false, message: "Invalid Admin Credentials" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
