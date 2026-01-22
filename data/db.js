const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// --- SUPABASE CONFIG ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ CRITICAL: Supabase Creds Missing in .env!");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
});

// Table Mappings
const TABLE_MAP = {
    'products.json': { table: 'products', pk: 'id' },
    'orders.json': { table: 'orders', pk: 'id' },
    'customers.json': { table: 'customers', pk: 'id' },
    'coupons.json': { table: 'coupons', pk: 'id' },
    'tickets.json': { table: 'tickets', pk: 'id' },
    'categories.json': { table: 'categories', pk: 'id' },
    'reviews.json': { table: 'reviews', pk: 'id' },
    'system_data.json': { table: 'system_data', pk: 'key' },
    'banners.json': { table: 'banners', pk: 'id' } // Handle gracefully if missing
};

// --- GLOBAL CACHE (Read-Through) ---
const CACHE = {
    products: null,
    orders: [],
    customers: [],
    tickets: [],
    banners: [],
    coupons: [],
    system_data: {}
};

// Helper: Format data for System Table (Object -> Array)
function formatForSystemDB(dataObj) {
    return Object.keys(dataObj).map(k => ({ key: k, value: dataObj[k] }));
}

// Helper: Format data from System Table (Array -> Object)
function formatFromSystemDB(dataArray) {
    const obj = {};
    if (Array.isArray(dataArray)) {
        dataArray.forEach(row => {
            obj[row.key] = row.value;
        });
    }
    return obj;
}

// WRITE (Syncs Cache + DB) - Simulates File Overwrite
async function writeLocalJSON(filename, data) {
    const config = TABLE_MAP[filename];
    if (!config) {
        console.warn(`⚠️ Warning: No table mapping for ${filename}. Skipping DB write.`);
        return;
    }

    // 1. Update Cache Immediately (Optimistic UI)
    const cacheKey = filename.replace('.json', '');
    CACHE[cacheKey] = data;

    try {
        // 2. Prepare Data
        let dbData = data;
        if (filename === 'system_data.json') {
            dbData = formatForSystemDB(data);
        }

        // 3. Sync to Supabase (Delete All + Insert All to handle deletions)
        // Note: For large tables, this is inefficient, but for <1000 items it ensures consistent state with "File Overwrite" logic.

        // A. Delete All Rows (Simulate Truncate)
        // We use a filter that matches everything. 'id' != ' impossible'
        const deleteFilter = filename === 'system_data.json' ? 'key' : 'id';
        const { error: delError } = await supabase
            .from(config.table)
            .delete()
            .neq(deleteFilter, 'placeholder_impossible_value');

        if (delError) throw delError;

        // B. Insert New Data
        if (dbData && dbData.length > 0) {
            const { error: insError } = await supabase
                .from(config.table)
                .insert(dbData);

            if (insError) throw insError;
        }

        console.log(`✅ Synced ${filename} to Supabase`);

    } catch (err) {
        console.error(`❌ Error writing ${filename} to Supabase:`, err.message);
        // Don't throw, let the app continue with cached data (Offline mode essentially)
    }
}

// READ (Populates Cache)
async function readLocalJSON(filename) {
    const config = TABLE_MAP[filename];
    const key = filename.replace('.json', '');

    // Return from Cache if populated? 
    // To ensure fresh data on restart/refetch, we fetch from DB. 
    // But for repeated calls in same request, cache is good if we manage it. 
    // The original code cached FOREVER after first load. We will stick to that pattern for performance.
    if (CACHE[key] && (Array.isArray(CACHE[key]) ? CACHE[key].length > 0 : Object.keys(CACHE[key]).length > 0)) {
        return CACHE[key]; // Uncomment to enable strict caching
    }

    if (!config) return [];

    try {
        const { data, error } = await supabase
            .from(config.table)
            .select('*');

        if (error) {
            // Table might not exist yet? Return empty.
            if (error.code === '42P01') { // Undefined Table
                console.warn(`⚠️ Table ${config.table} does not exist yet.`);
                return filename === 'system_data.json' ? {} : [];
            }
            throw error;
        }

        let result = data;
        if (filename === 'system_data.json') {
            result = formatFromSystemDB(data);
        }

        // Update Cache
        CACHE[key] = result;
        return result;

    } catch (err) {
        console.error(`❌ Error reading ${filename} from Supabase:`, err.message);
        // Fallback to empty
        return filename === 'system_data.json' ? {} : [];
    }
}

// Initialize
async function initializeDatabase() {
    console.log("🚀 Connecting to Supabase...");
    await readLocalJSON('products.json');
    await readLocalJSON('orders.json');
    await readLocalJSON('customers.json');
    await readLocalJSON('tickets.json');
    await readLocalJSON('coupons.json');
    await readLocalJSON('categories.json');
    await readLocalJSON('system_data.json');
    console.log("✅ Database Loaded into Memory");
}

module.exports = {
    writeLocalJSON,
    readLocalJSON,
    initializeDatabase
};
