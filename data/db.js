const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

// --- SUPABASE CONFIG ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ CRITICAL: Supabase Creds Missing in .env!");
}

// Custom fetch using Axios to bypass Node 22 native fetch issues
const customFetch = async (url, options = {}) => {
    try {
        const res = await axios({
            url,
            method: options.method || 'GET',
            headers: options.headers,
            data: options.body,
            responseType: 'text',
            validateStatus: () => true // Allow all status codes
        });
        return {
            ok: res.status >= 200 && res.status < 300,
            status: res.status,
            statusText: res.statusText,
            headers: new Headers(res.headers),
            text: async () => res.data,
            json: async () => JSON.parse(res.data)
        };
    } catch (error) {
        throw new Error(`fetch failed: ${error.message}`);
    }
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
    global: { fetch: customFetch }
});

// Table Mappings
// Table Mappings (Added idType)
const TABLE_MAP = {
    'products.json': { table: 'products', pk: 'id', idType: 'number' }, // ID is numeric (e.g. 1, 2, 3)
    'orders.json': { table: 'orders', pk: 'id', idType: 'number' }, // Usually numeric from previous context
    'customers.json': { table: 'customers', pk: 'id', idType: 'string' }, // 'usr_...'
    'coupons.json': { table: 'coupons', pk: 'id', idType: 'number' }, // Date.now()
    'tickets.json': { table: 'tickets', pk: 'id', idType: 'number' }, // Date.now()
    'categories.json': { table: 'categories', pk: 'id', idType: 'string' }, // 'software'
    'reviews.json': { table: 'reviews', pk: 'id', idType: 'number' }, // Date.now()
    'system_data.json': { table: 'system_data', pk: 'key', idType: 'string' },
    'banners.json': { table: 'banners', pk: 'id', idType: 'number' }
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
        } else if (filename === 'customers.json') {
            // Hotfix: Remove 'photo' and 'provider' if exists, as DB schema lacks them
            dbData = data.map(c => {
                const { photo, provider, ...rest } = c;
                return rest;
            });
        }

        // 3. Sync to Supabase (Safe Sync: Upsert + Cleanup)
        // This prevents data loss if the process hangs/crashes during sync.

        // A. Upsert New/Updated Data
        if (dbData && dbData.length > 0) {
            const { error: upsertError } = await supabase
                .from(config.table)
                .upsert(dbData, { onConflict: config.pk });

            if (upsertError) throw upsertError;
        }

        // B. Delete Stale Data (Cleaning up items that were removed locally)
        // We delete anything in the DB that is NOT in our current 'dbData' list.
        if (dbData && dbData.length > 0) {
            const currentIDs = dbData.map(item => item[config.pk]);

            // Chunking might be needed for very large arrays, but for this scale (10-100 items), this is safe.
            const { error: cleanupError } = await supabase
                .from(config.table)
                .delete()
                .not(config.pk, 'in', `(${currentIDs.join(',')})`); // PostgREST syntax for 'not.in'

            if (cleanupError) {
                console.warn(`⚠️ Non-fatal cleanup error for ${filename}:`, cleanupError.message);
            }
        } else {
            // Edge Case: If dbData is empty array [], it implies we want to clear the table.
            // We only do this if it's explicitly strictly empty array.
            if (Array.isArray(dbData) && dbData.length === 0) {
                const { error: clearError } = await supabase
                    .from(config.table)
                    .delete()
                    .neq(config.pk, -1); // Delete all
                if (clearError) throw clearError;
            }
        }

        console.log(`✅ Synced ${filename} to Supabase`);

    } catch (err) {
        console.error(`❌ Error writing ${filename} to Supabase:`, err.message);
        throw err; // Throw error so the caller knows the save failed!
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
