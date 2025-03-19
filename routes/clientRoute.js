const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientsController')
const authenticateUserToken = require('../middlewares/authenticateClient');


// Public routes
router.post('/register', clientController.createUser);
router.post('/login', clientController.loginUser);

// Protected routes
router.use(authenticateUserToken);

router.put('/me', clientController.updateUser);
router.delete('/me', clientController.deleteUser);

module.exports = router;