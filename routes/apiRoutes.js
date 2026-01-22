const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
// (DB Import handled below)
const { authenticateAdmin } = require('../middleware/auth');

// Note: I will update imports to point to correct relative paths.
// current file: routes/apiRoutes.js
// data/db.js is at ../data/db.js

// --- DB Import fix ---
const { writeLocalJSON: writeDB, readLocalJSON: readDB } = require('../data/db');

// --- MULTER CONFIG (Scoped here or exported?) ---
// Ideally should be in utils/upload.js but for now I'll duplicate or keep here.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../assets/uploads'); // Relative to routes/
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// --- UPLOAD ENDPOINT ---
router.post('/upload', authenticateAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        // Return the relative URL (asset path)
        const fileUrl = `assets/uploads/${req.file.filename}`;
        res.json({ success: true, url: fileUrl });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ success: false, message: "File upload failed" });
    }
});

// --- PRODUCTS ROUTES ---
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

router.get('/products', async (req, res) => {
    try {
        // Force refresh cache/read
        const products = await readDB('products.json');

        // Security Check: Is Admin?
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        let isAdmin = false;

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                if (decoded.role === 'admin') isAdmin = true;
            } catch (e) { /* Invalid token, treat as public */ }
        }

        if (isAdmin) {
            // Return FULL data for Admin with Metadata flag
            const fullData = products.map(p => ({ ...p, _isAdminView: true }));
            res.json(fullData);
        } else {
            // Return SANITIZED data for Public
            const sanitized = products.map(p => {
                const { autoDeliveryInfo, autoDeliveryImage, ...rest } = p;
                if (rest.variants) {
                    rest.variants = rest.variants.map(v => {
                        const { stock, ...vRest } = v;
                        // Hide actual codes, but preserve availability status for UI
                        const cleanStock = (stock || []).map(s => {
                            // If string (legacy), it's available. If object, check status.
                            const status = (typeof s === 'string') ? 'available' : (s.status || 'available');
                            // We ONLY return the status, effectively stripping 'text', 'image', 'orderId', etc.
                            return { status };
                        });
                        return { ...vRest, stock: cleanStock };
                    });
                }
                return rest;
            });
            res.json(sanitized);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read products' });
    }
});

router.post('/products', authenticateAdmin, async (req, res) => {
    const products = req.body;
    if (!Array.isArray(products)) {
        return res.status(400).json({ success: false, message: "Invalid data format. Expected array." });
    }

    try {
        await writeDB('products.json', products);
        res.json({ success: true, message: "Product order saved successfully." });
    } catch (e) {
        console.error("Error saving product order:", e);
        res.status(500).json({ success: false, message: "Failed to save order." });
    }
});

router.post('/products/add', authenticateAdmin, async (req, res) => {
    const newProduct = req.body;

    if (!newProduct.name || newProduct.price === undefined || newProduct.price === null) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        const allProducts = await readDB('products.json');

        // Generate ID
        if (!newProduct.id) {
            const maxId = allProducts.reduce((max, p) => (p.id > max ? p.id : max), 0);
            newProduct.id = maxId + 1;
        }

        allProducts.push(newProduct);
        await writeDB('products.json', allProducts);

        res.json({ success: true, message: "Product added successfully", product: newProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to add product" });
    }
});

// [NEW] Bulk Update Products
router.post('/products/bulk-update', authenticateAdmin, async (req, res) => {
    const { key, value } = req.body; // e.g., { key: 'viewInIndex', value: true }

    // Whitelist allowed keys for bulk update
    const allowedKeys = ['viewInIndex', 'autoStockOut'];
    if (!allowedKeys.includes(key)) {
        return res.status(400).json({ success: false, message: "Invalid key for bulk update" });
    }

    if (typeof value !== 'boolean') {
        return res.status(400).json({ success: false, message: "Value must be boolean" });
    }

    try {
        const allProducts = await readDB('products.json');

        // Update ALL products
        const updatedProducts = allProducts.map(p => ({
            ...p,
            [key]: value
        }));

        await writeDB('products.json', updatedProducts);

        res.json({ success: true, message: `All products updated: ${key} = ${value}` });
    } catch (err) {
        console.error("Bulk Update Error:", err);
        res.status(500).json({ success: false, message: "Failed to bulk update products", error: err.message, details: err });
    }
});

router.put('/products/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;

    try {
        const allProducts = await readDB('products.json');
        const productIndex = allProducts.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // DEBUG: Trace Stock Data
        if (updates.variants) {
            const fs = require('fs');
            const logMsg = `[${new Date().toISOString()}] UPDATE Product ${id}: Variants Count: ${updates.variants.length}\n` +
                updates.variants.map((v, i) => `  V${i}: Stock Length: ${v.stock ? v.stock.length : 'N/A'}`).join('\n') + '\n---\n';
            fs.appendFileSync('debug_log.txt', logMsg);
        }

        const updatedProduct = { ...allProducts[productIndex], ...updates };

        // [NEW] AUTO IN-STOCK LOGIC
        // If stock is added and autoStockOut is ON, verify total stock and set inStock = true
        if (updatedProduct.autoStockOut) {
            let totalStock = 0;
            if (updatedProduct.variants && Array.isArray(updatedProduct.variants)) {
                updatedProduct.variants.forEach(v => {
                    if (v.stock && Array.isArray(v.stock)) {
                        totalStock += v.stock.filter(s => typeof s === 'string' || (s.status === 'available' || !s.status)).length;
                    }
                });
            }

            // Only flip to TRUE if currently false and we now have stock
            // (We generally trust manual 'false' setting unless stock is explicitly added, 
            // but user request implies "when I add product, it doesn't auto in stock". 
            // So we force True if stock > 0).
            if (totalStock > 0) {
                updatedProduct.inStock = true;
            } else {
                // Should we force false? Maybe. But let's stick to the user's "Auto In Stock" request first.
                // If autoStockOut is ON, 0 stock SHOULD mean out of stock.
                updatedProduct.inStock = false;
            }
        }

        allProducts[productIndex] = updatedProduct;

        await writeDB('products.json', allProducts);

        res.json({ success: true, message: "Product updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to update product" });
    }
});

router.delete('/products/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        let allProducts = await readDB('products.json');
        allProducts = allProducts.filter(p => p.id !== id);

        await writeDB('products.json', allProducts);

        res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to delete product" });
    }
});

// --- CATEGORIES ROUTES ---
router.get('/categories', async (req, res) => {
    try {
        const categories = await readDB('categories.json');
        res.json(categories);
    } catch (err) {
        res.json([
            { "id": "streaming", "name": "Streaming" },
            { "id": "gaming", "name": "Gaming" },
            { "id": "tools", "name": "Tools & VPN" }
        ]);
    }
});

router.post('/categories', authenticateAdmin, async (req, res) => {
    const { name, id } = req.body;
    if (!name || !id) return res.status(400).json({ success: false, message: "Name and ID required" });

    try {
        const categories = await readDB('categories.json');
        if (categories.find(c => c.id === id)) {
            return res.status(400).json({ success: false, message: "Category ID already exists" });
        }
        categories.push({ id, name });
        await writeDB('categories.json', categories);
        res.json({ success: true, message: "Category added" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to add category" });
    }
});

router.put('/categories/:id', authenticateAdmin, async (req, res) => {
    const id = req.params.id;
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });

    try {
        let categories = await readDB('categories.json');
        const index = categories.findIndex(c => c.id === id);
        if (index === -1) return res.status(404).json({ success: false, message: "Category not found" });

        categories[index].name = name;
        await writeDB('categories.json', categories);
        res.json({ success: true, message: "Category updated" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update category" });
    }
});

router.delete('/categories/:id', authenticateAdmin, async (req, res) => {
    const id = req.params.id;
    try {
        let categories = await readDB('categories.json');
        categories = categories.filter(c => c.id !== id);
        await writeDB('categories.json', categories);
        res.json({ success: true, message: "Category deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete category" });
    }
});

// --- REVIEWS ROUTES (Admin) ---
// GET All Reviews
router.get('/all-reviews', authenticateAdmin, async (req, res) => {
    try {
        const reviews = await readDB('reviews.json');
        res.json(reviews || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load reviews" });
    }
});

// REPLY to Review
router.put('/reviews/:id/reply', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { reply } = req.body;

    try {
        const reviews = await readDB('reviews.json');
        const index = reviews.findIndex(r => r.id === id);

        if (index === -1) return res.status(404).json({ success: false, message: "Review not found" });

        reviews[index].reply = reply;
        reviews[index].replyDate = new Date().toISOString();

        await writeDB('reviews.json', reviews);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to save reply" });
    }
});

// DELETE Review
router.delete('/reviews/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        let reviews = await readDB('reviews.json');
        reviews = reviews.filter(r => r.id !== id);
        await writeDB('reviews.json', reviews);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete review" });
    }
});

// --- BANNERS ROUTES ---
// GET Banners
router.get('/banners', async (req, res) => {
    try {
        const banners = await readDB('banners.json') || [];
        res.json(banners);
    } catch (err) {
        // If file missing, return empty array
        res.json([]);
    }
});

// ADD Banner
router.post('/banners', authenticateAdmin, async (req, res) => {
    const { image, link } = req.body;
    if (!image) return res.status(400).json({ success: false, message: "Image URL required" });

    try {
        const banners = await readDB('banners.json') || [];
        const newBanner = {
            id: Date.now(),
            image,
            link: link || '',
            date: new Date().toISOString()
        };
        banners.push(newBanner);
        await writeDB('banners.json', banners);
        res.json({ success: true, banner: newBanner });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to save banner" });
    }
});

// DELETE Banner
router.delete('/banners/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        let banners = await readDB('banners.json') || [];
        banners = banners.filter(b => b.id !== id);
        await writeDB('banners.json', banners);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete banner" });
    }
});

module.exports = router;
