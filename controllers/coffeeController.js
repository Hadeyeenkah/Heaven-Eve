const Coffee = require('../dbModels/coffeeSchema');

// Create a new coffee
const createCoffee = async (req, res) => {
    const { name, description, price, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : ""; // Save image path

    // Validate input data
    if (!name || !price) {
        return res.status(400).json({ error: 'Name and price are required' });
    }

    try {
        const newCoffee = new Coffee({ name, description, price, imageUrl, category });
        await newCoffee.save();
        res.status(201).json(newCoffee);
    } catch (error) {
        console.error(error); // Log error for debugging
        res.status(400).json({ error: error.message });
    }
};

// Get all coffees
const getAllCoffees = async (req, res) => {
    try {
        const coffees = await Coffee.find().select('-__v'); // Exclude internal fields like __v
        res.json(coffees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch coffees' });
    }
};

// Get coffee by ID
const getCoffeeById = async (req, res) => {
    try {
        const coffee = await Coffee.findById(req.params.id).select('-__v');
        if (!coffee) return res.status(404).json({ error: 'Coffee not found' });
        res.json(coffee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch coffee' });
    }
};

// Update a coffee
const updateCoffee = async (req, res) => {
    const { name, description, price, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Handle image update

    // Validate input data
    if (!name || !price) {
        return res.status(400).json({ error: 'Name and price are required' });
    }

    try {
        const updatedCoffee = await Coffee.findByIdAndUpdate(
            req.params.id,
            { name, description, price, imageUrl, category },
            { new: true }
        ).select('-__v');

        if (!updatedCoffee) return res.status(404).json({ error: 'Coffee not found' });

        // If a new image is uploaded, consider deleting the old image (server-side logic)
        if (imageUrl && updatedCoffee.imageUrl && updatedCoffee.imageUrl !== imageUrl) {
            // Delete the old image from the server (you can use fs.unlinkSync if using local storage)
        }

        res.json(updatedCoffee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update coffee' });
    }
};

// Delete a coffee
const deleteCoffee = async (req, res) => {
    try {
        const deletedCoffee = await Coffee.findByIdAndDelete(req.params.id);
        if (!deletedCoffee) return res.status(404).json({ error: 'Coffee not found' });

        // Optionally delete the image from the server if it exists
        if (deletedCoffee.imageUrl) {
            // Delete the image from the server (using fs.unlinkSync for local storage)
        }

        res.json({ message: 'Coffee deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete coffee' });
    }
};

module.exports = {
    createCoffee,
    getAllCoffees,
    getCoffeeById,
    updateCoffee,
    deleteCoffee
};
