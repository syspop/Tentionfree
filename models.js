const mongoose = require('mongoose');

// Define Schemas
// We remove 'id: false' to allow default virtual for models without custom ID (like Orders).
const schemaOptions = { strict: false, timestamps: true };


const productSchema = new mongoose.Schema({ id: Number }, schemaOptions);
const orderSchema = new mongoose.Schema({ id: Number }, schemaOptions);
const customerSchema = new mongoose.Schema({ id: String }, schemaOptions); // Customer ID is string 'usr_...'
const ticketSchema = new mongoose.Schema({ id: Number }, schemaOptions);

// Export Models
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = { Product, Order, Customer, Ticket };
