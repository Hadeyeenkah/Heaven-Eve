const mongoose = require('mongoose');

const coffeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true, min: 0 },  // Ensure price is a non-negative value
    imageUrl: { 
        type: String, 
        match: /^https?:\/\//  // Simple regex to validate URL format
    },
    category: { 
        type: String, 
        enum: ['Espresso', 'Latte', 'Cappuccino', 'Mocha', 'Cold Brew'], // Define predefined categories
        default: 'Espresso' 
    }
},
{
    timestamps: true
});

// Optionally, add an index for category if you often query by category
coffeeSchema.index({ category: 1 });

module.exports = mongoose.model('Coffee', coffeeSchema);
