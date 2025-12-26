const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Product, Order, Customer, Ticket } = require('./models');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB...');
        seedData();
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

const readJson = (fileName) => {
    try {
        const filePath = path.join(__dirname, 'data', fileName);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ File not found: ${fileName}. Skipping.`);
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`❌ Error reading ${fileName}:`, err.message);
        return [];
    }
};

const seedData = async () => {
    try {
        // 1. Products
        const products = readJson('products.json');
        if (products.length > 0) {
            await Product.deleteMany({}); // Clear existing to ensure clean state matching JSON
            await Product.insertMany(products);
            console.log(`📦 Imported ${products.length} Products.`);
        }

        // 2. Orders
        const orders = readJson('orders.json');
        if (orders.length > 0) {
            await Order.deleteMany({});
            await Order.insertMany(orders);
            console.log(`📦 Imported ${orders.length} Orders.`);
        }

        // 3. Customers
        const customers = readJson('customers.json');
        if (customers.length > 0) {
            await Customer.deleteMany({});
            await Customer.insertMany(customers);
            console.log(`📦 Imported ${customers.length} Customers.`);
        }

        // 4. Tickets
        const tickets = readJson('tickets.json');
        if (tickets.length > 0) {
            await Ticket.deleteMany({});
            await Ticket.insertMany(tickets);
            console.log(`📦 Imported ${tickets.length} Tickets.`);
        }

        console.log('🎉 Data Migration Complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seeding Failed:', err);
        process.exit(1);
    }
};
