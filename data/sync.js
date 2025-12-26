const fs = require('fs').promises;
const path = require('path');
const { Product, Order, Customer, Ticket } = require('../models');

const DATA_DIR = path.join(__dirname);

// Helper to write data to JSON file
async function writeLocalJSON(filename, data) {
    try {
        await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
        // console.log(`✅ Synced ${filename}`);
    } catch (err) {
        console.error(`❌ Error writing ${filename}:`, err);
    }
}

// Helper to read data from JSON file
async function readLocalJSON(filename) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            // If not found, return empty array
            return [];
        }
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`❌ Error reading ${filename}:`, err);
        return [];
    }
}

// Sync all data from MongoDB to Local JSON
async function syncFromMongo() {
    console.log("🔄 Syncing data from MongoDB to Local JSON...");
    try {
        const products = await Product.find({});
        await writeLocalJSON('products.json', products);

        const orders = await Order.find({});
        await writeLocalJSON('orders.json', orders);

        const customers = await Customer.find({});
        await writeLocalJSON('customers.json', customers);

        const tickets = await Ticket.find({});
        await writeLocalJSON('tickets.json', tickets);

        console.log("✅ Data Sync Complete!");
        return true;
    } catch (err) {
        console.error("❌ Data Sync Failed:", err);
        return false;
    }
}

module.exports = {
    writeLocalJSON,
    readLocalJSON,
    syncFromMongo
};
