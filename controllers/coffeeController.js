const Coffee = require('../dbModels/coffeeSchema');

const createCoffee = async (req, res) => {
    const { name, description, price, category  } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : ""; // Save image path

    try {
        const newCoffee = new Coffee({ name, description, price, imageUrl, category,  });
        await newCoffee.save();
        res.status(201).json(newCoffee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllCoffees = async (req, res) => {
    try {
        const coffees = await Coffee.find();
        res.json(coffees);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch coffees' });
    }
};

const getCoffeeById = async (req, res) => {
    try {
        const coffee = await Coffee.findById(req.params.id);
        if (!coffee) return res.status(404).json({ error: 'Coffee not found' });
        res.json(coffee);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch coffee' });
    }
};

const updateCoffee = async (req, res) => {
    const { name, description, price, category,  } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : ""; // Save image path

    try {
        const updatedCoffee = await Coffee.findByIdAndUpdate(
            req.params.id,
            { name, description, price, imageUrl, category,  },
            { new: true }
        );

        if (!updatedCoffee) return res.status(404).json({ error: 'Coffee not found' });

        res.json(updatedCoffee);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update coffee' });
    }
};

const deleteCoffee = async (req, res) => {
    try {
        const deletedCoffee = await Coffee.findByIdAndDelete(req.params.id);
        if (!deletedCoffee) return res.status(404).json({ error: 'Coffee not found' });
        res.json({ message: 'Coffee deleted successfully' });
    } catch (error) {
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