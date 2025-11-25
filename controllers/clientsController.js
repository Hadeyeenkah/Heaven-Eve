const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Clients = require('../dbModels/clientsSchema');

// Function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: '30d' });
};

const clientController = {
    // Register a new user
    createUser: asyncHandler(async (req, res) => {
        const { username, email, password, phone } = req.body;

        // Validate input
        if (!username || !email || !password || !phone) {
            res.status(400);
            throw new Error('Username, email, password, and phone number are required!');
        }

        // Check if the user already exists
        const userExist = await Clients.findOne({ email });

        if (userExist) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = await Clients.create({
            username,
            email,
            password: hashedPassword,
            phone,
        });

        if (newUser) {
            res.status(201).json({
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                token: generateToken(newUser._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    }),

    // Login a user
    loginUser: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400);
            throw new Error('Email and password are required!');
        }

        // Find the user by email
        const user = await Clients.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid credentials');
        }
    }),

    // Delete the current user's account
    deleteUser: asyncHandler(async (req, res) => {
        const userId = req.user.id; // Get user ID from the JWT token

        const user = await Clients.findByIdAndDelete(userId);

        if (user) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    }),

    // Update user details
    updateUser: asyncHandler(async (req, res) => {
        const { username, email, password, phone } = req.body;
        const userId = req.user.id; // Get user ID from the JWT token

        // Find the user by ID
        const user = await Clients.findById(userId);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Check if the email is being changed and if it's already in use
        if (email && email !== user.email) {
            const emailExists = await Clients.findOne({ email });
            if (emailExists) {
                res.status(400);
                throw new Error('Email is already in use');
            }
        }

        // Update user details
        user.username = username || user.username;
        user.email = email || user.email;
        user.phone = phone || user.phone;

        // If password is provided, hash and update it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // Save the updated user
        const updatedUser = await user.save();

        if (updatedUser) {
            res.status(200).json({
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                phone: updatedUser.phone,
            });
        } else {
            res.status(400);
            throw new Error('Failed to update user');
        }
    }),
};

module.exports = clientController;
