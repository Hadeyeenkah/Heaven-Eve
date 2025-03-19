const mongoose = require('mongoose');

const coffeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    imageUrl: String,
    category: String,
},
{
    timestamps: true
})

module.exports = mongoose.model('Coffee', coffeeSchema);