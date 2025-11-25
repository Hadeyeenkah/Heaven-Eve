const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Clients', 
        required: true 
    },
    coffeeItems: [
        {
            coffeeId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Coffee', 
                required: true 
            },
            quantity: { 
                type: Number, 
                required: true, 
                min: 1  // Ensure quantity is always a positive integer
            }
        }
    ],
    totalPrice: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Processing', 'Completed', 'Shipped', 'Canceled'], // You can extend the status as needed
        default: 'Pending' 
    },
    orderDate: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });  // Automatically adds createdAt and updatedAt

// Pre-save hook to calculate totalPrice dynamically if coffeeItems change
orderSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('coffeeItems')) {
        let total = 0;
        this.coffeeItems.forEach(item => {
            total += item.quantity * item.coffeeId.price; // Ensure price is populated in queries
        });
        this.totalPrice = total;
    }
    next();
});

// Optionally, you could add indexes for performance optimization
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
