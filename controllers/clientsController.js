const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Clients = require('../dbModels/clientsSchema');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: '30d' })
};
const clientController = {
    createUser: asyncHandler(async (req, res) => {
        const { username, email, password, phone  } = req.body;

        if (!username || !email || !password || !phone ) {
            res.status(400);
            throw new Error('Username, email, password, and phone number are required!');
        }

        const userExist = await Clients.findOne({ email });

        if (userExist) {
            res.status(400);
            throw new Error('User already exists');
        }
       
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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
                token: generateToken(newUser._id)
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    }),

    loginUser: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error('Email and password are required!');
        }

        const user = await Clients.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400);
            throw new Error('Invalid credentials');

        }
    }),
     
    deleteUser: asyncHandler(async (req, res) => {
        const userId = req.user.id; // Assuming the user can only delete their own account

        const user = await Clients.findByIdAndDelete(userId);

        if (user) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    }),

    updateUser: asyncHandler(async (req, res) => {
        const { username, email, password, phone } = req.body;
        const userId = req.user.id;
   
        const user = await Clients.findById(userId);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (email && email !== user.email) {
            const emailExists = await Clients.findOne({ email });
            if (emailExists) {
                res.status(400);
                throw new Error('Email is already in use');
            }
        }
   
        user.username = username || user.username;
        user.email = email || user.email;
        user.phone = phone || user.phone;
    

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();
   
        if (updatedUser) {
            res.status(200).json({
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                name: updatedUser.name,
                phone: updatedUser.phone,
            });
        } else {
            res.status(400);
            throw new Error('Failed to update user');
        }
    }),
}


module.exports = clientController;