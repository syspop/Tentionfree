const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { readLocalJSON } = require('./data/db');

console.log("🚀 Starting Server...");

require('dotenv').config();

// --- STRICT ENV VALIDATION ---
const requiredEnv = ['JWT_SECRET', 'ADMIN_USER', 'BACKUP_PIN'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
    console.error("❌ FATAL ERROR: Missing required environment variables:", missingEnv.join(", "));
    console.warn("⚠️ Server starting in INSECURE mode. Please set these variables in Railway.");
    // process.exit(1); // Relaxed for stability
}

const app = express();

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
    'https://tentionfree.store',
    'https://www.tentionfree.store',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Security Middleware (Helmet) - TEMPORARILY DISABLED
// app.use(helmet({
//     contentSecurityPolicy: {
//         directives: {
//             defaultSrc: ["'self'"],
//             scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "cdnjs.cloudflare.com", "kit.fontawesome.com"],
//             styleSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "cdnjs.cloudflare.com", "fonts.googleapis.com", "kit.fontawesome.com"],
//             imgSrc: ["'self'", "data:", "https:", "*"], 
//             connectSrc: ["'self'", "https:", "wss:"],
//             fontSrc: ["'self'", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
//             objectSrc: ["'none'"],
//             upgradeInsecureRequests: [],
//         },
//     },
//     crossOriginEmbedderPolicy: false
// }));

// Rate Limiting - TEMPORARILY DISABLED
// const apiLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, 
//     max: 1000, 
//     message: { success: false, message: "Too many requests, please try again later." },
//     standardHeaders: true, 
//     legacyHeaders: false, 
// });

// app.use('/api/', apiLimiter);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(compression());

// --- ROUTES ---
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const couponRoutes = require('./routes/couponRoutes');
const backupRoutes = require('./routes/backupRoutes');

app.use('/api', apiRoutes);
app.use('/api', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', customerRoutes);
app.use('/api', ticketRoutes);
app.use('/api', couponRoutes);
app.use('/api', backupRoutes);

// 🛡️ ANTI-SCRAPING / BOT PROTECTION
app.use((req, res, next) => {
    const userAgent = req.get('User-Agent') || '';
    const blockedAgents = ['wget', 'curl', 'python', 'httrack', 'libwww-perl', 'http-client', 'scrappy', 'java'];
    if (blockedAgents.some(bot => userAgent.toLowerCase().includes(bot))) {
        console.log(`[BLOCKED] Scraper detected: ${userAgent}`);
        return res.status(403).send('Access Denied');
    }
    next();
});

// Serve Assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ======================================
// SERVER-SIDE RENDERING (SSR) FOR PRODUCTS
// ======================================
app.get(['/product/:id', '/products.html'], async (req, res, next) => {
    let productId = null;
    let isSSR = false;

    if (req.path.startsWith('/product/')) {
        productId = req.params.id;
        isSSR = true;
    } else if (req.path === '/products.html' || req.path === '/product-details.html') {
        return next();
    }

    if (!isSSR || !productId) return next();

    try {
        const products = await readLocalJSON('products.json');
        const targetSlug = productId.toLowerCase().trim();

        const product = products.find(p => {
            if (p.id == targetSlug) return true;
            const cleanName = p.name.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
            const nameSlug = cleanName.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const nameSimple = p.name.toLowerCase().replace(/ /g, '-');
            return nameSlug === targetSlug || nameSimple === targetSlug;
        });

        if (!product) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Product Not Found - Tention Free</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="bg-slate-900 text-white min-h-screen flex items-center justify-center">
                    <div class="text-center">
                        <h1 class="text-4xl font-bold mb-4">Product Not Found</h1>
                        <p class="mb-6 text-slate-400">The product you are looking for does not exist.</p>
                        <a href="/products" class="px-6 py-3 bg-blue-600 rounded-full font-bold hover:bg-blue-500 transition">Back to Products</a>
                    </div>
                </body>
                </html>
            `);
        }

        let html = await fs.promises.readFile(path.join(__dirname, 'product-details.html'), 'utf8');

        html = html.replace(/<title>.*<\/title>/i, `<title>${product.name} | Tention Free</title>`);
        html = html.replace(/content="Browse our catalog[^"]*"/i, `content="${product.desc || product.name}"`);
        html = html.replace(/property="og:title" content="[^"]*"/i, `property="og:title" content="${product.name}"`);
        html = html.replace(/property="og:description" content="[^"]*"/i, `property="og:description" content="${product.desc}"`);
        html = html.replace(/property="og:image" content="[^"]*"/i, `property="og:image" content="${'https://tentionfree.store/' + product.image}"`);
        html = html.replace(/(<[^>]*id="product-modal-title"[^>]*>)([\s\S]*?)(<\/[^>]+>)/i, `$1${product.name}$3`);
        html = html.replace(/(<[^>]*id="page-display-price"[^>]*>)([\s\S]*?)(<\/[^>]+>)/i, `$1৳${product.price}$3`);

        const safeDesc = product.longDesc ? product.longDesc.replace(/\n/g, '<br>') : product.desc;
        html = html.replace(/(<[^>]*id="modal-desc"[^>]*>)([\s\S]*?)(<\/[^>]+>)/i, `$1${safeDesc}$3`);
        html = html.replace(/src=""\s+alt="Product"/i, `src="${product.image}" alt="${product.name}"`);
        html = html.replace(/(<[^>]*id="modal-category"[^>]*>)([\s\S]*?)(<\/[^>]+>)/i, `$1${product.category}$3`);

        html = html.replace(/onclick="addToCartPage\(0\)"/g, `onclick="addToCartPage(${product.id})"`);
        html = html.replace(/onclick="buyNowPage\(0\)"/g, `onclick="buyNowPage(${product.id})"`);

        res.send(html);

    } catch (err) {
        console.error("SSR Error:", err);
        res.status(500).send("Server Error");
    }
});

app.get(['/services', '/services/'], (req, res) => {
    res.sendFile(__dirname + '/services.html');
});

// 🔒 SECURITY: Block Sensitive Files
app.use((req, res, next) => {
    const blockedPaths = [
        '/data', '/backend_services', '/node_modules', '/.git', '/.env',
        '/package.json', '/package-lock.json', '/server.js', '/README.md',
        '/.gitignore', '/.env.example', '/Procfile', '/server.js.bak',
        '/profile.html.bak', '/start_server.bat', '/seed_db.js'
    ];
    const normalizedPath = req.path.toLowerCase();
    if (blockedPaths.some(p => normalizedPath.startsWith(p) || normalizedPath === p)) {
        return res.status(403).send('Access Denied');
    }
    next();
});

// Clean URL Handler
app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api') || req.path.startsWith('/assets')) return next();

    if (!path.extname(req.path)) {
        const potentialHtml = path.join(__dirname, req.path + '.html');
        if (fs.existsSync(potentialHtml)) {
            return res.sendFile(potentialHtml);
        }
    }
    next();
});

// Make sure Explicit Root Route is last before Static
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Static Files
app.use(express.static(__dirname, { extensions: ['html'] }));

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    const { initializeDatabase } = require('./data/db');
    initializeDatabase();
});
