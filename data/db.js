const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname);

// --- GLOBAL IN-MEMORY CACHE ---
// --- GLOBAL IN-MEMORY CACHE ---
const CACHE = {
    products: null,
    orders: [],
    customers: [],
    tickets: [],
    banners: [],
    coupons: [],
    system_data: null // Added system_data
};

// Helper to write data to JSON file (Atomic Write)
async function writeLocalJSON(filename, data) {
    // 1. Write to Temp File, then Rename (Atomic)
    const filePath = path.join(DATA_DIR, filename);
    const tempPath = filePath + '.tmp';

    try {
        await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
        await fs.rename(tempPath, filePath);

        // 2. Update Cache
        const key = filename.replace('.json', '');
        CACHE[key] = data; // Always update cache, don't check hasOwnProperty

    } catch (err) {
        console.error(`❌ Error writing ${filename}:`, err);
        try { await fs.unlink(tempPath); } catch (e) { }
        throw err;
    }
}

// Helper to read data from JSON file (and use Cache)
async function readLocalJSON(filename) {
    const key = filename.replace('.json', '');

    // 1. Return from Cache if available (SUPER FAST)
    if (CACHE[key]) {
        return CACHE[key];
    }

    try {
        const filePath = path.join(DATA_DIR, filename);
        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            // Default return based on file type guess
            if (filename.includes('data') || filename.includes('system')) return {};
            return []; // Default to array for others
        }
        const data = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(data);

        // Populate cache
        CACHE[key] = parsed;
        return parsed;
    } catch (err) {
        console.error(`❌ Error reading ${filename}:`, err);
        if (filename.includes('data') || filename.includes('system')) return {};
        return [];
    }
}

// Initialize Database (Load all into RAM)
async function initializeDatabase() {
    console.log("📥 initializeDatabase called...");
    try {
        console.log("   - Loading products.json...");
        await readLocalJSON('products.json');
        console.log("   - Loading orders.json...");
        await readLocalJSON('orders.json');
        console.log("   - Loading customers.json...");
        await readLocalJSON('customers.json');
        console.log("   - Loading tickets.json...");
        await readLocalJSON('tickets.json');
        console.log("   - Loading banners.json...");
        await readLocalJSON('banners.json');
        console.log("   - Loading coupons.json...");
        await readLocalJSON('coupons.json');
        console.log("✅ Inbuilt Database Cache Populated");
    } catch (error) {
        console.error("❌ Fatal Error in initializeDatabase:", error);
    }
}

module.exports = {
    writeLocalJSON,
    readLocalJSON,
    initializeDatabase
};


