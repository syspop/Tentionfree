const mongoose = require('mongoose');

// Define Schemas
const productSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const orderSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const customerSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const ticketSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

// Export Models
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = { Product, Order, Customer, Ticket };
