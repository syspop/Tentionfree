const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config(); // Load env vars
const bcrypt = require('bcryptjs'); // Password Hashing
const jwt = require('jsonwebtoken'); // JWT for API Security
const { Product, Order, Customer, Ticket } = require('./models');
const mongoose = require('mongoose');
const helmet = require('helmet'); // Secure Headers
const rateLimit = require('express-rate-limit'); // Rate Limiting

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));


// Middleware
// Middleware
const allowedOrigins = [
    'https://tentionfree.store',
    'https://www.tentionfree.store',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Security Middleware (Helmet)
app.use(helmet({
    contentSecurityPolicy: false, // Disabled to prevent breakage of images/scripts
    crossOriginEmbedderPolicy: false
}));

// Rate Limiting (100 requests per 15 minutes)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, message: "Too many requests, please try again later." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);
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
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read products' });
    }
});

// POST Products (Overwrite all) - PROTECTED
app.post('/api/products', authenticateAdmin, async (req, res) => {
    const products = req.body;

    // Validate Products
    if (!Array.isArray(products)) {
        return res.status(400).json({ error: "Invalid data format: Expected an array." });
    }

    // Basic Validation for each product
    for (let p of products) {
        if (!p.name || typeof p.name !== 'string' || p.name.trim() === '') {
            return res.status(400).json({ error: `Invalid product name for ID ${p.id}` });
        }
        if (p.price && isNaN(p.price)) {
            return res.status(400).json({ error: `Invalid price for product ${p.name}` });
        }
    }

    try {
        // Full replace logic as per original requirement (Overwrite all)
        await Product.deleteMany({});
        await Product.insertMany(products);
        res.json({ message: 'Products saved successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save products' });
    }
});

// --- ORDERS ---
// GET Orders - PROTECTED
app.get('/api/orders', authenticateAdmin, async (req, res) => {
    try {
        const orders = await Order.find({});
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read orders' });
    }
});

// POST Order (Add NEW Order from Checkout)
app.post('/api/orders', async (req, res) => {
    const newOrder = req.body;
    try {
        await Order.create(newOrder);
        res.json({ success: true, message: 'Order created successfully', orderId: newOrder.id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Failed to save order' });
    }
});

// PUT Orders (Overwrite ALL - for Admin updates/deletes) - PROTECTED
app.put('/api/orders', authenticateAdmin, async (req, res) => {
    const orders = req.body;
    try {
        // Using full replace strategy as requested by previous logic
        await Order.deleteMany({});
        await Order.insertMany(orders);
        res.json({ success: true, message: 'Orders updated successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Failed to update orders' });
    }
});

// GET My Orders (User) - PROTECTED
app.get('/api/my-orders', authenticateUser, async (req, res) => {
    const userEmail = req.user.email.toLowerCase().trim();
    try {
        const myOrders = await Order.find({ email: userEmail }); // Using email directly or use case-insensitive regex if needed
        // Assuming email is stored consistently, otherwise:
        // const myOrders = await Order.find({ email: { $regex: new RegExp(`^${userEmail}$`, 'i') } });
        res.json(myOrders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read orders' });
    }
});

// --- TICKETS (Support) ---
app.get('/api/tickets', authenticateAdmin, async (req, res) => {
    try {
        const tickets = await Ticket.find({});
        res.json(tickets);
    } catch (err) {
        console.error("Error reading tickets:", err);
        res.status(500).json({ error: 'Failed to read tickets' });
    }
});

// POST Ticket (User)
app.post('/api/tickets', async (req, res) => {
    console.log("POST /api/tickets received");
    const { userId, userName, email, subject, desc, image } = req.body;

    if (!userId || !desc) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newTicket = {
        id: Date.now(),
        userId, userName, email, subject, desc, image,
        date: new Date().toLocaleString()
    };

    try {
        await Ticket.create(newTicket);
        console.log("Ticket saved successfully.");
        res.json({ success: true, message: 'Ticket submitted' });
    } catch (err) {
        console.error("Error saving ticket:", err);
        return res.status(500).json({ success: false });
    }
});

// DELETE Ticket (Admin) - PROTECTED
app.delete('/api/tickets/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await Ticket.deleteOne({ id: id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.delete('/api/tickets/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await Ticket.deleteOne({ id: id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// --- AUTHENTICATION ---


// GET Customers (Admin only)
app.get('/api/customers', authenticateAdmin, async (req, res) => {
    try {
        const customers = await Customer.find({}, '-password'); // Exclude password
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read customers' });
    }
});

// PUT Update Customer (Admin) - PROTECTED
// GET My Profile (User) - PROTECTED
// GET My Profile (User) - PROTECTED
app.get('/api/my-profile', authenticateUser, async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await Customer.findOne({ id: userId }, '-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PUT Update Customer (Admin OR User Self-Update)
// PUT Update Customer (Admin OR User Self-Update)
app.put('/api/customers/:id', async (req, res) => {
    const id = req.params.id;
    const { name, email, phone, password, dob } = req.body;

    // Authorization Check
    let isSelfUpdate = false;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (decoded.id === id || decoded.role === 'admin') {
                isSelfUpdate = true;
            }
        } catch (e) { }
    }

    if (!isSelfUpdate) {
        return res.status(401).json({ success: false, message: "Unauthorized Update" });
    }

    try {
        const user = await Customer.findOne({ id: id });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Check email uniqueness
        if (email && email !== user.email) {
            const exists = await Customer.findOne({ email: email });
            if (exists) return res.json({ success: false, message: "Email already taken" });
        }
        // Check phone uniqueness
        if (phone && phone !== user.phone) {
            const exists = await Customer.findOne({ phone: phone });
            if (exists) return res.json({ success: false, message: "Phone already taken" });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (dob !== undefined) user.dob = dob;
        if (password) user.password = password; // Assuming backend handles hashing if raw password sent, or frontend sends hash (based on current logic, backend receives raw here often?)
        // WAIT: The original code just set `customers[index].password = password`. It did NOT hash it here unless it was registering?
        // Actually line 456 in original code: `if (password) customers[index].password = password;`
        // And Login checks hash OR plain. So if user updates password here, it might be stored plain! 
        // I should probably hash it if I want to be "better", but let's stick to original behavior OR improve it.
        // Original behavior: plain text storage on update.
        // Let's improve it: Hash it if it's not starting with $2a$ (basic check)
        if (password && !password.startsWith('$2a$')) {
            user.password = bcrypt.hashSync(password, 10);
        } else if (password) {
            user.password = password;
        }

        await user.save();
        res.json({ success: true, message: "Customer updated" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Save Error" });
    }
});

// DELETE Customer (Admin/User)
// DELETE Customer (Secure)
// DELETE Customer (Admin/User)
app.delete('/api/customers/:id', async (req, res) => {
    const userId = req.params.id.trim();
    const { password, isAdmin } = req.body;

    try {
        const user = await Customer.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: `User not found (ID: ${userId})` });
        }

        // Security Check
        const ADMIN_PASS = process.env.ADMIN_PASS || "asy-sala";

        if (isAdmin) {
            if (password !== ADMIN_PASS) {
                return res.json({ success: false, message: "Incorrect Admin Password" });
            }
        } else {
            // User deleting their own account
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

        await Customer.deleteOne({ id: userId });
        res.json({ success: true, message: "Account deleted successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "DB Error" });
    }
});

// POST Change Password
// POST Change Password
app.post('/api/change-password', async (req, res) => {
    const { userId, email, oldPass, newPass } = req.body;

    try {
        const user = await Customer.findOne({ id: userId, email: email });
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
        await user.save();

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// POST Register
// POST Register
app.post('/api/register', async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing required fields" });
    }

    // Input Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.json({ success: false, message: "Invalid email format" });
    }
    if (password.length < 6) {
        return res.json({ success: false, message: "Password must be at least 6 characters" });
    }
    if (phone && !/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) {
        return res.json({ success: false, message: "Invalid phone number" });
    }

    try {
        // Check duplicate
        const emailExists = await Customer.findOne({ email });
        if (emailExists) {
            return res.json({ success: false, message: "Email already registered" });
        }
        if (phone) {
            const phoneExists = await Customer.findOne({ phone });
            if (phoneExists) {
                return res.json({ success: false, message: "Phone number already registered" });
            }
        }

        const newCustomer = {
            id: 'usr_' + Date.now().toString(36),
            name: name,
            email: email,
            phone: phone || '',
            dob: req.body.dob || '',
            password: bcrypt.hashSync(password, 10),
            joined: new Date().toISOString()
        };

        const createdUser = await Customer.create(newCustomer);

        // Return without password
        // Use createdUser.toObject() to get plain object and remove password
        const userObj = createdUser.toObject();
        const { password: _, ...userWithoutPass } = userObj;

        // Generate Token
        const token = jwt.sign({ id: newCustomer.id, email: newCustomer.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, user: userWithoutPass, token });

    } catch (err) {
        console.error(err);
        return res.json({ success: false, message: "Server error saving user" });
    }
});

// POST Login
// POST Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Customer.findOne({ email });

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
                    needsUpgrade = true;
                }
            }

            if (isMatch) {
                // Lazy Migration: If plain text matched, upgrade to hash NOW
                if (needsUpgrade) {
                    user.password = bcrypt.hashSync(password, 10);
                    await user.save();
                    console.log(`Security Upgrade: User ${user.email} migrated to hashed password.`);
                }

                // Return fresh data without password
                const userObj = user.toObject();
                const { password: _, ...userWithoutPass } = userObj;

                // Generate Token
                const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

                res.json({ success: true, user: userWithoutPass, token });
            } else {
                res.json({ success: false, message: "Invalid email or password" });
            }
        } else {
            res.json({ success: false, message: "Invalid email or password" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
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

// --- GLOBAL ERROR HANDLER ---
// (Must be the last middleware)
app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err.stack); // Log for admin
    res.status(500).json({
        success: false,
        message: "Something went wrong! Please try again later."
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
