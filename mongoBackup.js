const mongoose = require('mongoose');
require('dotenv').config();

// Define flexible schemas to match whatever is in the JSON files
const Schema = mongoose.Schema;

const productSchema = new Schema({}, { strict: false, timestamps: true });
const orderSchema = new Schema({}, { strict: false, timestamps: true });
const customerSchema = new Schema({}, { strict: false, timestamps: true });
const ticketSchema = new Schema({}, { strict: false, timestamps: true });

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);

const connectMongoDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.warn("⚠️ MONGO_URI not found in .env. MongoDB backup is disabled.");
            return;
        }
        await mongoose.connect(uri);
        console.log("✅ MongoDB Backup Service Connected");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
    }
};

// Generic function to sync a JSON array to a MongoDB collection
const syncCollection = async (modelName, dataArray) => {
    if (mongoose.connection.readyState !== 1) return; // Only proceed if connected

    try {
        let Model;
        if (modelName === 'products') Model = Product;
        else if (modelName === 'orders') Model = Order;
        else if (modelName === 'customers') Model = Customer;
        else if (modelName === 'tickets') Model = Ticket;

        if (!Model) return;

        // Clear existing backup for this collection and replace with new data
        // This ensures the backup mirrors the JSON file exactly (handling deletes, updates)
        await Model.deleteMany({});
        
        if (Array.isArray(dataArray) && dataArray.length > 0) {
            await Model.insertMany(dataArray);
        }
        
        console.log(`📦 Backup: Synced ${dataArray.length} items to ${modelName} collection.`);

    } catch (err) {
        console.error(`❌ Backup Failed for ${modelName}:`, err.message);
    }
};

module.exports = { connectMongoDB, syncCollection };
