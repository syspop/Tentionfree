const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');

const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from current directory

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

// POST Products (Overwrite all)
app.post('/api/products', (req, res) => {
    const products = req.body;
    fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 4), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to save products' });
        }
        res.json({ message: 'Products saved successfully' });
    });
});

// --- ORDERS ---
// GET Orders
app.get('/api/orders', (req, res) => {
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
            res.json({ success: true, message: 'Order created successfully', orderId: newOrder.id });
        });
    });
});

// PUT Orders (Overwrite ALL - for Admin updates/deletes)
app.put('/api/orders', (req, res) => {
    const orders = req.body;
    fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 4), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Failed to update orders' });
        }
        res.json({ success: true, message: 'Orders updated successfully' });
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

// GET Customers (Admin only ideally, but public for this MVP as per request)
app.get('/api/customers', (req, res) => {
    const customers = getCustomers();
    // Return safe data (exclude passwords if necessary, but here likely okay or strip them)
    // Let's strip passwords to be safe
    const safeCustomers = customers.map(c => {
        const { password, ...rest } = c;
        return rest;
    });
    res.json(safeCustomers);
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

    const newCustomer = {
        id: 'usr_' + Date.now().toString(36),
        name: name,
        email: email,
        phone: phone || '',
        password: password, // In production, use bcrypt. Here simple storage as requested for MVP.
        joined: new Date().toISOString()
    };

    customers.push(newCustomer);

    fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 4), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: "Server error saving user" });
        }
        // Return without password
        const { password, ...userWithoutPass } = newCustomer;
        res.json({ success: true, user: userWithoutPass });
    });
});

// POST Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const customers = getCustomers();

    const user = customers.find(c => c.email === email && c.password === password);

    if (user) {
        const { password, ...userWithoutPass } = user;
        res.json({ success: true, user: userWithoutPass });
    } else {
        res.json({ success: false, message: "Invalid email or password" });
    }
});

// POST Admin Login
app.post('/api/admin-login', (req, res) => {
    const { user, pass } = req.body;

    // Hardcoded credentials as requested
    const ADMIN_USER = "sai-sad";
    const ADMIN_PASS = "asy-sala";

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Invalid Admin Credentials" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
