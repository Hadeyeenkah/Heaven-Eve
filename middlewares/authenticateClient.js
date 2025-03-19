const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Clients = require('../dbModels/clientsSchema');

const authenticateUserToken = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
           
            // Verify token
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            console.log('Decoded Token:', decoded); // Debugging: Log the decoded token

            // Get user from token
            req.user = await Clients.findById(decoded.id).select('-password');
            if (!req.user) {
                res.status(401);
                throw new Error('User not found');
            }

            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = authenticateUserToken;