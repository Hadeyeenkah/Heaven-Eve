const Order = require('../dbModels/orderSchema');
const Coffee = require('../dbModels/coffeeSchema');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 */
const createOrder = async (req, res) => {
    const { customerId, coffeeItems } = req.body;

    try {
        let totalPrice = 0;
        const updatedCoffees = [];

        // Check if coffee exists and calculate total price
        for (let item of coffeeItems) {
            const coffee = await Coffee.findById(item.coffeeId);
            if (!coffee) return res.status(404).json({ error: `Coffee with ID ${item.coffeeId} not found` });


            totalPrice += coffee.price * item.quantity;
            updatedCoffees.push({ coffeeId: coffee._id, quantity: item.quantity });
        }


        // Create and save the order
        const newOrder = new Order({ customerId, coffeeItems: updatedCoffees, totalPrice });
        await newOrder.save();

        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        res.status(500).json({ error: 'Failed to place order' });
    }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 */
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('customerId').populate('coffeeItems.coffeeId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

/**
 * @desc    Get a single order by ID
 * @route   GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('customerId').populate('coffeeItems.coffeeId');
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

/**
 * @desc    Update an order status
 * @route   PUT /api/orders/:id
 */
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('customerId').populate('coffeeItems.coffeeId');

        if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
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
        res.status(500).json({ error: 'Failed to delete order' });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};
