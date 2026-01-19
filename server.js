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

// 🔒 SECURITY: Block Sensitive Files (MUST BE FIRST)
app.use((req, res, next) => {
    const blockedPaths = [
        '/data', '/backend_services', '/node_modules', '/.git', '/.env',
        '/package.json', '/package-lock.json', '/server.js', '/README.md',
        '/.gitignore', '/.env.example', '/Procfile', '/server.js.bak',
        '/profile.html.bak', '/start_server.bat', '/seed_db.js',
        '/admin/admin_backup.html'
    ];
    const normalizedPath = req.path.toLowerCase();
    if (blockedPaths.some(p => normalizedPath.startsWith(p) || normalizedPath === p)) {
        console.log(`[BLOCKED] Access to sensitive file: ${req.path}`);
        return res.status(403).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Access Denied - Security</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
            </head>
            <body class="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4 font-sans">
                <div class="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-blue-500/5 pointer-events-none"></div>
                    
                    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6 relative z-10">
                        <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    
                    <h1 class="text-3xl font-bold mb-3 relative z-10">Restricted Access</h1>
                    <p class="text-slate-400 mb-8 relative z-10 leading-relaxed">
                        This file is protected for security reasons. You cannot access it directly.
                    </p>
                    
                    <a href="/" class="relative z-10 inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg shadow-blue-500/25">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        Back to Home
                    </a>
                </div>
            </body>
            </html>
        `);
    }
    next();
});

// Middleware
const allowedOrigins = [
    'https://tentionfree.store',
    'https://www.tentionfree.store',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

// 🔒 HOTLINK PROTECTION (Block Direct Image Access)
app.use('/assets', (req, res, next) => {
    const referer = req.headers.referer;
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(req.path);

    // If it's an image and has NO referer (Direct Access) or Wrong Referer
    if (isImage) {
        if (!referer) {
            // Block Direct Access (Type URL in browser)
            return res.status(403).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Image Protected</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="bg-gray-950 min-h-screen flex flex-col items-center justify-center p-4 text-white">
                    <div class="relative w-full max-w-lg bg-gray-900 rounded-3xl p-10 text-center shadow-2xl border border-gray-800">
                        <div class="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <h1 class="text-2xl font-bold mb-4">Direct Access Not Allowed</h1>
                        <p class="text-gray-400 mb-8">
                            This image is protected. You can only view it on <span class="text-blue-400 font-medium">tentionfree.store</span>.
                        </p>
                        <a href="/" class="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all">
                            Visit Website
                        </a>
                    </div>
                </body>
                </html>
            `);
        }

        const origin = new URL(referer).origin;
        if (!allowedOrigins.includes(origin) && !origin.includes('tentionfree.store')) {
            return res.status(403).send('Access Denied: Hotlinking is not allowed.');
        }
    }
    next();
});

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || origin === 'null') return callback(null, true);
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

// 404 HANDLER (Styled Page)
app.use((req, res, next) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Page Not Found - Tention Free</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
                .float-anim { animation: float 6s ease-in-out infinite; }
            </style>
        </head>
        <body class="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4 font-sans overflow-hidden relative">
            
            <!-- Background Elements -->
            <div class="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div class="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div class="max-w-2xl w-full text-center relative z-10">
                <div class="float-anim mb-8">
                    <h1 class="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 drop-shadow-2xl">404</h1>
                </div>
                
                <h2 class="text-4xl font-bold mb-4">Ooops! Page Not Found</h2>
                <p class="text-slate-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                
                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a href="/" class="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/25 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        Go Home
                    </a>
                    
                    <a href="#" onclick="history.back()" class="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-semibold transition-all duration-300 border border-slate-700 hover:border-slate-600 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Go Back
                    </a>
                </div>

                <div class="mt-12 pt-8 border-t border-slate-800/50">
                    <p class="text-slate-500 text-sm">Error Code: 404_NOT_FOUND | Path: <span class="font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded inline-block max-w-[200px] truncate align-bottom">${req.path}</span></p>
                </div>
            </div>
        </body>
        </html>
    `);
});


// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    const { initializeDatabase } = require('./data/db');
    initializeDatabase();
});
