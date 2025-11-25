const Order = require('../dbModels/orderSchema');
const Coffee = require('../dbModels/coffeeSchema');
const mongoose = require('mongoose');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 */
const createOrder = async (req, res) => {
    const { customerId, coffeeItems } = req.body;

    // Validate required fields
    if (!customerId || !Array.isArray(coffeeItems) || coffeeItems.length === 0) {
        return res.status(400).json({ error: 'Customer ID and coffee items are required' });
    }

    try {
        let totalPrice = 0;
        const updatedCoffees = [];

        // Check if coffee exists and calculate total price
        for (let item of coffeeItems) {
            const coffee = await Coffee.findById(item.coffeeId);
            if (!coffee) {
                return res.status(404).json({ error: `Coffee with ID ${item.coffeeId} not found` });
            }

            // Check if there's enough stock
            if (coffee.stock < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for coffee ${coffee.name}` });
            }

            totalPrice += coffee.price * item.quantity;
            updatedCoffees.push({ coffeeId: coffee._id, quantity: item.quantity });
        }

        // Create and save the order
        const newOrder = new Order({ customerId, coffeeItems: updatedCoffees, totalPrice });
        await newOrder.save();

        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ error: 'Failed to place order', details: error.message });
    }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 */
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('customerId', 'name email') // only return necessary fields
            .populate('coffeeItems.coffeeId', 'name price'); // only return necessary fields
        res.json(orders);
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
    }
};

/**
 * @desc    Get a single order by ID
 * @route   GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customerId', 'name email') // only return necessary fields
            .populate('coffeeItems.coffeeId', 'name price');
        
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ error: 'Failed to fetch order', details: error.message });
    }
};

/**
 * @desc    Update an order status
 * @route   PUT /api/orders/:id
 */
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;

    // Validate status
    if (!status || !['pending', 'shipped', 'delivered'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('customerId', 'name email')
          .populate('coffeeItems.coffeeId', 'name price');

        if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });

        res.json(updatedOrder);
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ error: 'Failed to update order', details: error.message });
    }
};

/**
 * @desc    Delete an order
 * @route   DELETE /api/orders/:id
 */
const deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ error: 'Failed to delete order', details: error.message });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};
