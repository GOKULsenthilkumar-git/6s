const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
    '/register',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    authController.register
);

router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    authController.login
);

router.get('/profile', protect, authController.getProfile);

// Admin only routes for user management
const roleMiddleware = require('../middleware/roleMiddleware');
router.get('/users', protect, roleMiddleware('admin'), authController.getAllUsers);
router.put('/users/:id', protect, roleMiddleware('admin'), authController.updateUserRole);
router.delete('/users/:id', protect, roleMiddleware('admin'), authController.deleteUser);

module.exports = router;