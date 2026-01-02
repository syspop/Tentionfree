const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname);

// --- GLOBAL IN-MEMORY CACHE ---
const CACHE = {
    products: null,
    orders: null,
    customers: null,
    tickets: null
};

// Helper to write data to JSON file (and update Cache)
async function writeLocalJSON(filename, data) {
    // 1. Update Cache Immediately
    const key = filename.replace('.json', '');
    if (CACHE.hasOwnProperty(key)) {
        CACHE[key] = data;
    }

    // 2. Write to File (Async - await to ensure persistence)
    try {
        await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`❌ Error writing ${filename}:`, err);
        throw err; // Propagate error so caller knows write failed
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
            return []; // Return empty array if file doesn't exist
        }
        const data = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(data);

        // Populate cache
        CACHE[key] = parsed;
        return parsed;
    } catch (err) {
        console.error(`❌ Error reading ${filename}:`, err);
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
