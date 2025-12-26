const mongoose = require('mongoose');
require('dotenv').config();
const { Order } = require('./models');

const MONGO_URI = process.env.MONGO_URI;

const checkOrders = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const orders = await Order.find({});
        console.log(`📦 Found ${orders.length} Orders.`);
        if (orders.length > 0) {
            console.log(`First Order ID: ${orders[0].id} (Type: ${typeof orders[0].id})`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
checkOrders();
