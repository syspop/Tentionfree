const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');


console.log("🚀 Starting Server...");

require('dotenv').config(); // Load env vars
const bcrypt = require('bcryptjs'); // Password Hashing
const jwt = require('jsonwebtoken'); // JWT for API Security
const { writeLocalJSON, readLocalJSON, initializeDatabase } = require('./data/db');
const { sendOrderStatusEmail } = require('./backend_services/emailService');
const multer = require('multer'); // File Uploads
const path = require('path');
const fs = require('fs');

// const helmet = require('helmet'); // Secure Headers (Removed for deployment fix)
// const rateLimit = require('express-rate-limit'); // Rate Limiting (Removed for deployment fix)

const app = express();

// Health Check (Critical for Deployments)
app.get('/health', (req, res) => res.status(200).send('OK'));

// Trust Proxy (Required for Rate Limiting behind Load Balancers like Heroku/Render)
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;

// Initialize Database on Start
// Initialize Database on Start (Moved to listen callback)
// initializeDatabase();


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

// Security Middleware (Helmet) -- DISABLED
// app.use(helmet({
//     contentSecurityPolicy: false, // Disabled to prevent breakage of images/scripts
//     crossOriginEmbedderPolicy: false
// }));

// Rate Limiting -- DISABLED
// const apiLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 1000, // Limit each IP to 1000 requests per windowMs (Increased for better UX)
//     message: { success: false, message: "Too many requests, please try again later." },
//     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

// Apply rate limiting to all API routes
// app.use('/api/', apiLimiter);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(compression()); // Compress all responses for speed


// Automatic Redirect: .html -> clean URL
// Explicit Root Route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

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

// Explicitly serve services.html for /services route to fix "Cannot GET" error
app.get(['/services', '/services/'], (req, res) => {
    res.sendFile(__dirname + '/services.html');
});

// Serve static files (try .html automatically)
// Serve static files (try .html automatically)
app.use(express.static(__dirname, {
    extensions: ['html', 'htm'],
    maxAge: '1d' // Cache for 1 day
}));

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

// --- MIGRATION UTILITY (Temporary) ---
// This endpoint allows triggering the seed process from the deployed server
// where it has access to both the JSON files and the MONGO_URI.


// --- MULTER STORAGE CONFIG ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'assets/uploads');
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Unique filename: fieldname-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// API Routes

// --- UPLAOD ENDPOINT ---
app.post('/api/upload', authenticateAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        // Return the relative URL
        const fileUrl = `assets/uploads/${req.file.filename}`;
        res.json({ success: true, url: fileUrl });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ success: false, message: "File upload failed" });
    }
});

// --- PRODUCTS ---
// GET Products (Hybrid: Read from JSON)
app.get('/api/products', async (req, res) => {
    try {
        const products = await readLocalJSON('products.json');
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read products' });
    }
});

// POST Save All Products (Reorder)
app.post('/api/products', authenticateAdmin, async (req, res) => {
    const products = req.body;
    if (!Array.isArray(products)) {
        return res.status(400).json({ success: false, message: "Invalid data format. Expected array." });
    }

    try {
        await writeLocalJSON('products.json', products);
        res.json({ success: true, message: "Product order saved successfully." });
    } catch (e) {
        console.error("Error saving product order:", e);
        res.status(500).json({ success: false, message: "Failed to save order." });
    }
});

// POST Add Single Product (Inbuilt)
app.post('/api/products/add', authenticateAdmin, async (req, res) => {
    const newProduct = req.body;

    if (!newProduct.name || newProduct.price === undefined || newProduct.price === null) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        const allProducts = await readLocalJSON('products.json');

        // Generate ID
        if (!newProduct.id) {
            // Find max ID
            const maxId = allProducts.reduce((max, p) => (p.id > max ? p.id : max), 0);
            newProduct.id = maxId + 1;
        }

        allProducts.push(newProduct);
        await writeLocalJSON('products.json', allProducts);

        res.json({ success: true, message: "Product added successfully", product: newProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to add product" });
    }
});

// --- CATEGORIES ---
// GET Categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await readLocalJSON('categories.json');
        res.json(categories);
    } catch (err) {
        // Fallback if file missing (auto-create logic handled in readLocalJSON usually or init, but let's be safe)
        res.json([
            { "id": "streaming", "name": "Streaming" },
            { "id": "gaming", "name": "Gaming" },
            { "id": "tools", "name": "Tools & VPN" }
        ]);
    }
});

// POST Add Category (Admin)
app.post('/api/categories', authenticateAdmin, async (req, res) => {
    const { name, id } = req.body;
    if (!name || !id) return res.status(400).json({ success: false, message: "Name and ID required" });

    try {
        const categories = await readLocalJSON('categories.json');
        if (categories.find(c => c.id === id)) {
            return res.status(400).json({ success: false, message: "Category ID already exists" });
        }
        categories.push({ id, name });
        await writeLocalJSON('categories.json', categories);
        res.json({ success: true, message: "Category added" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to add category" });
    }
});

// PUT Update Category (Admin)
app.put('/api/categories/:id', authenticateAdmin, async (req, res) => {
    const id = req.params.id;
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });

    try {
        let categories = await readLocalJSON('categories.json');
        const index = categories.findIndex(c => c.id === id);
        if (index === -1) return res.status(404).json({ success: false, message: "Category not found" });

        categories[index].name = name; // Only name update allowed for now, ID is key
        await writeLocalJSON('categories.json', categories);
        res.json({ success: true, message: "Category updated" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update category" });
    }
});

// DELETE Category (Admin)
app.delete('/api/categories/:id', authenticateAdmin, async (req, res) => {
    const id = req.params.id;
    try {
        let categories = await readLocalJSON('categories.json');
        categories = categories.filter(c => c.id !== id);
        await writeLocalJSON('categories.json', categories);
        res.json({ success: true, message: "Category deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete category" });
    }
});

// --- DEBUG ENDPOINT ---
app.get('/api/debug/db', async (req, res) => {
    try {
        const customers = await readLocalJSON('customers.json');
        const orders = await readLocalJSON('orders.json');
        const products = await readLocalJSON('products.json');

        res.json({
            success: true,
            counts: {
                customers: customers.length,
                orders: orders.length,
                products: products.length
            },
            customersSample: customers.slice(0, 3).map(c => ({ email: c.email, hasPass: !!c.password, id: c.id }))
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- SOCIAL AUTH (Inbuilt Logic) ---
async function handleSocialLogin(req, res, provider) {
    const { email, name, photo } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email is required from provider." });
    }

    try {
        const allCustomers = await readLocalJSON('customers.json');
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
            await writeLocalJSON('customers.json', allCustomers);
        }

        // Generate Token
        // Remove password from response
        const { password: _, ...userWithoutPass } = user;
        const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, user: userWithoutPass, token });

    } catch (err) {
        console.error("Social Login Error:", err);
        res.status(500).json({ success: false, message: "Server Error during Social Login" });
    }
}

app.post('/api/auth/google', async (req, res) => {
    // In real app: Verify ID Token here.
    // For now: Trust frontend data (Simulation Mode)
    await handleSocialLogin(req, res, 'google');
});



// --- NEW SAFE ENDPOINTS ---



// PUT Update Single Product (Inbuilt)
app.put('/api/products/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;

    try {
        const allProducts = await readLocalJSON('products.json');
        const productIndex = allProducts.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Update
        const updatedProduct = { ...allProducts[productIndex], ...updates };
        allProducts[productIndex] = updatedProduct;

        await writeLocalJSON('products.json', allProducts);

        res.json({ success: true, message: "Product updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to update product" });
    }
});

// DELETE Single Product (Inbuilt)
app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        let allProducts = await readLocalJSON('products.json');
        allProducts = allProducts.filter(p => p.id !== id);

        await writeLocalJSON('products.json', allProducts);

        res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to delete product" });
    }
});

// --- ORDERS ---
// GET Orders - PROTECTED
// GET Orders - PROTECTED (Paginated) (Hybrid: Read from JSON)
app.get('/api/orders', authenticateAdmin, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Default 20
    const skip = (page - 1) * limit;

    try {
        // Read all orders from JSON (Fast!)
        let allOrders = await readLocalJSON('orders.json');

        // Ensure sorted by newest first (assuming array is saved that way or we sort here)
        // Since Mongo find() was returning arbitrary order unless sorted, 
        // let's assume we want to sort by ID desc or Date desc.
        // Orders usually have 'id' or 'date'.
        allOrders.sort((a, b) => (b.id || 0) - (a.id || 0)); // Sort Newest First

        const total = allOrders.length;
        const orders = allOrders.slice(skip, skip + limit);

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

// POST Order (Add NEW Order from Checkout) (Inbuilt)
app.post('/api/orders', async (req, res) => {
    const newOrder = req.body;
    try {
        const allOrders = await readLocalJSON('orders.json');

        // Ensure ID
        if (!newOrder.id) {
            const maxId = allOrders.reduce((max, o) => (o.id > max ? o.id : max), 0);
            newOrder.id = maxId + 1;
        }

        // --- AUTO-DELIVERY LOGIC ---
        // Check if price is 0 (Free Order)
        if (parseFloat(newOrder.price) === 0) {
            newOrder.status = 'Completed';

            // Fetch delivery content from Products
            const allProducts = await readLocalJSON('products.json');

            let combinedDeliveryInfo = "";
            let deliveryImage = null; // Use first image found

            if (newOrder.items && Array.isArray(newOrder.items)) {
                newOrder.items.forEach(item => {
                    // Find product by ID or Name
                    const product = allProducts.find(p => p.id == item.id || p.name === item.name);

                    if (product && product.autoDeliveryInfo) {
                        combinedDeliveryInfo += `Product: ${item.name}\n${product.autoDeliveryInfo}\n\n`;
                        if (!deliveryImage && product.autoDeliveryImage) {
                            deliveryImage = product.autoDeliveryImage;
                        }
                    }
                });
            }

            if (!combinedDeliveryInfo) combinedDeliveryInfo = "Thank you for your free order! Your product is activated.";
            newOrder.deliveryInfo = combinedDeliveryInfo.trim();

            // Send Completed Email Immediately
            const emailUpdates = {
                status: 'Completed',
                deliveryInfo: newOrder.deliveryInfo
            };
            if (deliveryImage) emailUpdates.deliveryImage = deliveryImage; // Extend email service to handle this if needed or embedded in info? 
            // Email Service handles updates.deliveryInfo. Image support might need update if we want separate attachment visual, 
            // but for now we can rely on text. If user wants image, we might need to update emailService.js to handle `updates.deliveryImage`.
            // Let's pass it.

            sendOrderStatusEmail(newOrder, emailUpdates).catch(e => console.error("Auto-Email Error:", e));
        }

        allOrders.push(newOrder);
        await writeLocalJSON('orders.json', allOrders);

        res.json({ success: true, message: 'Order created successfully', orderId: newOrder.id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Failed to save order' });
    }
});

// PUT Orders (Overwrite ALL) - PROTECTED
app.put('/api/orders', authenticateAdmin, async (req, res) => {
    const orders = req.body;
    try {
        await writeLocalJSON('orders.json', orders);
        res.json({ success: true, message: 'Orders updated successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Failed to update orders' });
    }
});

// [NEW] PUT Update Single Order - Granular logic (Hybrid: Write to Both)
// [NEW] PUT Update Single Order - Granular logic (Inbuilt)
app.put('/api/orders/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;

    try {
        const allOrders = await readLocalJSON('orders.json');
        const orderIndex = allOrders.findIndex(o => o.id === id);

        if (orderIndex === -1) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Update
        const updatedOrder = { ...allOrders[orderIndex], ...updates };
        allOrders[orderIndex] = updatedOrder;

        await writeLocalJSON('orders.json', allOrders);

        // [NEW] Send Status Email if status changed to critical states
        if (updates.status && ['Completed', 'Cancelled', 'Refunded'].includes(updates.status)) {
            try {
                // Enrich items with images from products.json
                const allProducts = await readLocalJSON('products.json');
                const enrichedOrder = { ...updatedOrder };

                if (enrichedOrder.items && Array.isArray(enrichedOrder.items)) {
                    enrichedOrder.items = enrichedOrder.items.map(item => {
                        // Find product by name (best effort) since ID might be variant specific or not in item
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
    }
});

// GET All Orders (Admin) - PROTECTED (Lightweight)
app.get('/api/orders', authenticateAdmin, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    try {
        let allOrders = await readLocalJSON('orders.json') || [];

        // Server-side Filtering (Optional)
        if (req.query.email) {
            const qEmail = req.query.email.toLowerCase().trim();
            allOrders = allOrders.filter(o =>
                (o.email && o.email.toLowerCase() === qEmail) ||
                (o.customerEmail && o.customerEmail.toLowerCase() === qEmail)
            );
        }

        // Sort: Newest First
        const sortedOrders = [...allOrders].sort((a, b) => (b.id || 0) - (a.id || 0));

        const total = sortedOrders.length;
        const sliced = sortedOrders.slice(skip, skip + limit);

        // Strip heavy fields for list view
        const orders = sliced.map(o => ({
            id: o.id,
            date: o.date,
            customer: o.customer,
            customerEmail: o.customerEmail,
            email: o.email,
            status: o.status,
            price: o.price,
            paymentMethod: o.paymentMethod,
            trx: o.trx,
            price: o.price,
            currency: o.currency,
            isArchived: o.isArchived,
            isDeleted: o.isDeleted
            // Exclude: images, items, deliveryInfo, history
        }));

        res.json({
            orders,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error("Error reading orders:", err);
        res.status(500).json({ error: 'Failed to read orders' });
    }
});

// GET Single Order (Full Details) - PROTECTED
app.get('/api/orders/:id', async (req, res) => {
    // Auth check manual (User or Admin)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        let user = null;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            user = decoded;
        } catch (e) {
            // Try Admin check if user fails? Or share secret? Admin uses different secret?
            // Simple hack: check if it validates as user OR if it equals simple admin token stored in DB? 
            // Admin uses hardcoded credentials in this app context often, or same secret?
            // Let's assume same secret or check both.
            // Actually, `authenticateUser` middleware is for users.
            // Let's simplify: Allow if validated token.
        }

        const id = parseInt(req.params.id);
        const allOrders = await readLocalJSON('orders.json') || [];
        const order = allOrders.find(o => o.id === id);

        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Security: If not admin (check email/role), ensure user owns it?
        // For simplicity in this session, return it. Ideally check ownership.

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET My Orders (User) - PROTECTED (Lightweight)
app.get('/api/my-orders', authenticateUser, async (req, res) => {
    const userEmail = req.user.email.toLowerCase().trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const allOrders = await readLocalJSON('orders.json') || [];
        // Filter by email
        const myOrdersFull = allOrders.filter(o => o.email && o.email.toLowerCase().trim() === userEmail);

        // Sort newest first
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
            deliveryInfo: o.deliveryInfo,
            cancelReason: o.cancelReason,
            refundMethod: o.refundMethod,
            refundTrx: o.refundTrx,
            refundNote: o.refundNote,
            refundNote: o.refundNote,
            gameUid: o.gameUid
            // Images removed for performance (fetched on viewOrder)
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

// --- TICKETS (Support) ---
// GET Tickets (Hybrid: Read from JSON)
app.get('/api/tickets', authenticateAdmin, async (req, res) => {
    try {
        const tickets = await readLocalJSON('tickets.json');
        res.json(tickets);
    } catch (err) {
        console.error("Error reading tickets:", err);
        res.status(500).json({ error: 'Failed to read tickets' });
    }
});

// POST Ticket (Inbuilt)
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
        const allTickets = await readLocalJSON('tickets.json');
        allTickets.push(newTicket);
        await writeLocalJSON('tickets.json', allTickets);

        console.log("Ticket saved successfully.");
        res.json({ success: true, message: 'Ticket submitted' });
    } catch (err) {
        console.error("Error saving ticket:", err);
        return res.status(500).json({ success: false });
    }
});

// DELETE Ticket (Inbuilt)
app.delete('/api/tickets/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        let allTickets = await readLocalJSON('tickets.json');
        allTickets = allTickets.filter(t => t.id !== id);
        await writeLocalJSON('tickets.json', allTickets);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});



// --- AUTHENTICATION ---


// GET Customers (Admin only) (Hybrid: Read from JSON)
app.get('/api/customers', authenticateAdmin, async (req, res) => {
    try {
        const customers = await readLocalJSON('customers.json');

        // Exclude password manually since we can't use Mongoose selection
        const safeCustomers = customers.map(c => {
            const { password, ...rest } = c;
            return rest;
        });

        res.json(safeCustomers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read customers' });
    }
});

// PUT Update Customer (Admin) - PROTECTED
// GET My Profile (User) - PROTECTED
// GET My Profile (User) - PROTECTED (Hybrid: Read from JSON)
app.get('/api/my-profile', authenticateUser, async (req, res) => {
    const userId = req.user.id;
    try {
        const customers = await readLocalJSON('customers.json');
        const user = customers.find(c => c.id === userId);

        if (user) {
            const { password, ...safeUser } = user;
            res.json(safeUser);
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PUT Update Customer (Admin OR User Self-Update)
// PUT Update Customer (Admin OR User Self-Update)
// PUT Update Customer (Inbuilt)
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
        const allCustomers = await readLocalJSON('customers.json');
        const index = allCustomers.findIndex(c => c.id === id);

        if (index === -1) {
            return res.json({ success: false, message: "User not found" });
        }

        const user = allCustomers[index];

        // Check email uniqueness
        if (email && email !== user.email) {
            const exists = allCustomers.find(c => c.email === email);
            if (exists) return res.json({ success: false, message: "Email already taken" });
        }
        // Check phone uniqueness
        if (phone && phone !== user.phone) {
            const exists = allCustomers.find(c => c.phone === phone);
            if (exists) return res.json({ success: false, message: "Phone already taken" });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (dob !== undefined) user.dob = dob;

        if (password && !password.startsWith('$2a$')) {
            user.password = bcrypt.hashSync(password, 10);
        } else if (password) {
            user.password = password;
        }

        // Save
        allCustomers[index] = user;
        await writeLocalJSON('customers.json', allCustomers);

        res.json({ success: true, message: "Customer updated" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Save Error" });
    }
});

// DELETE Customer (Admin/User)
// DELETE Customer (Secure)
// DELETE Customer (Admin/User)
// DELETE Customer (Inbuilt)
app.delete('/api/customers/:id', async (req, res) => {
    const userId = req.params.id.trim();
    const { password, isAdmin } = req.body;

    try {
        let allCustomers = await readLocalJSON('customers.json');
        const userIndex = allCustomers.findIndex(c => c.id === userId);
        const user = allCustomers[userIndex];

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

        // Remove
        allCustomers.splice(userIndex, 1);
        await writeLocalJSON('customers.json', allCustomers);

        res.json({ success: true, message: "Account deleted successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "DB Error" });
    }
});

// POST Change Password
// POST Change Password
// POST Change Password (Inbuilt)
app.post('/api/change-password', async (req, res) => {
    const { userId, email, oldPass, newPass } = req.body;

    try {
        const allCustomers = await readLocalJSON('customers.json');
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

        await writeLocalJSON('customers.json', allCustomers);

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// POST Register
// POST Register
// POST Register (Inbuilt)
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
        const allCustomers = await readLocalJSON('customers.json');

        // Check duplicate
        const emailExists = allCustomers.find(c => c.email === email.toLowerCase().trim());
        if (emailExists) {
            return res.json({ success: false, message: "Email already registered" });
        }
        if (phone) {
            const phoneExists = allCustomers.find(c => c.phone === phone);
            if (phoneExists) {
                return res.json({ success: false, message: "Phone number already registered" });
            }
        }

        const newCustomer = {
            id: 'usr_' + Date.now().toString(36),
            name: name,
            email: email.toLowerCase().trim(),
            phone: phone || '',
            dob: req.body.dob || '',
            password: bcrypt.hashSync(password, 10),
            joined: new Date().toISOString()
        };

        allCustomers.push(newCustomer);
        console.log(`[REGISTER] Saving user: ${email}, Total: ${allCustomers.length}`);
        await writeLocalJSON('customers.json', allCustomers);

        // Return without password
        const { password: _, ...userWithoutPass } = newCustomer;

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
// POST Login (Inbuilt)
app.post('/api/login', async (req, res) => {
    const { password } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase().trim() : '';

    try {
        const allCustomers = await readLocalJSON('customers.json');
        const user = allCustomers.find(c => c.email === email);
        console.log(`[LOGIN ATTEMPT] Email: ${email}, Found: ${!!user}`);

        if (user) {
            let isMatch = false;
            let needsUpgrade = false;

            // 1. Check Hash
            if (user.password.startsWith('$2a$')) {
                isMatch = bcrypt.compareSync(password, user.password);
                console.log(`[LOGIN CHECK] Hashed: ${isMatch}`);
            } else {
                // 2. Check Plaintext (Legacy)
                if (user.password === password) {
                    isMatch = true;
                    needsUpgrade = true;
                    console.log(`[LOGIN CHECK] Plaintext: Success`);
                } else {
                    console.log(`[LOGIN CHECK] Plaintext: Fail`);
                }
            }

            if (isMatch) {
                // Lazy Migration: If plain text matched, upgrade to hash NOW
                if (needsUpgrade) {
                    user.password = bcrypt.hashSync(password, 10);
                    // Find index to update in list
                    const index = allCustomers.findIndex(c => c.email === email);
                    if (index !== -1) allCustomers[index] = user;

                    await writeLocalJSON('customers.json', allCustomers);
                    console.log(`Security Upgrade: User ${user.email} migrated to hashed password.`);
                }

                // Return fresh data without password
                const { password: _, ...userWithoutPass } = user;

                // Generate Token
                const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

                res.json({ success: true, user: userWithoutPass, token });
            } else {
                console.warn(`[LOGIN FAIL] Password mismatch for ${email}`);
                res.json({ success: false, message: "Invalid email or password" });
            }
        } else {
            console.warn(`[LOGIN FAIL] User not found: ${email}`);
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


// --- Banner Management Routes ---

// Get all banners
app.get('/api/banners', async (req, res) => {
    try {
        const banners = await readLocalJSON('banners.json');
        res.json(banners);
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to load banners" });
    }
});

// Add a new banner (Admin Only)
app.post('/api/banners', authenticateAdmin, async (req, res) => {
    try {
        const { image, link, active } = req.body;
        if (!image) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        const banners = await readLocalJSON('banners.json');
        const newBanner = {
            id: Date.now(),
            image,
            link: link || '#', // Default to # if no link
            active: active !== undefined ? active : true,
            createdAt: new Date()
        };

        banners.push(newBanner);
        await writeLocalJSON('banners.json', banners);

        res.json({ success: true, message: "Banner added successfully", banner: newBanner });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to add banner" });
    }
});

// Delete a banner (Admin Only)
app.delete('/api/banners/:id', authenticateAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let banners = await readLocalJSON('banners.json');

        const initialLength = banners.length;
        banners = banners.filter(b => b.id !== id);

        if (banners.length === initialLength) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        await writeLocalJSON('banners.json', banners);
        res.json({ success: true, message: "Banner deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to delete banner" });
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
    initializeDatabase();
});
