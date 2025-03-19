const express = require('express');
const upload = require("../middlewares/upload");




const {
    createCoffee,
    getAllCoffees,
    getCoffeeById,
    updateCoffee,
    deleteCoffee
} = require('../controllers/coffeeController');

const router = express.Router();

// Define coffee routes
router.post('/', upload.single("image"), createCoffee);
router.get('/', getAllCoffees);
router.get('/:id', getCoffeeById);
router.put('/:id', updateCoffee);
router.delete('/:id', deleteCoffee);

module.exports = router;