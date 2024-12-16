const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
    timestamp: Date,
    price: Number,
    currency: String
});

const Price = mongoose.model('Price', priceSchema);

module.exports = Price;