const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');

const authController = {
    // @desc    Register a new user
    // @route   POST /api/auth/register
    // @access  Public
    async register(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, role } = req.body;

            // Check if user exists
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Validate role (only admin and applicant allowed)
            const validRoles = ['admin', 'applicant'];
            const userRole = role && validRoles.includes(role) ? role : 'applicant';

            // Create user
            const user = await User.create({
                email,
                password,
                role: userRole
            });

            if (user) {
                res.status(201).json({
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user)
                });
            }
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    },

    // @desc    Auth user & get token
    // @route   POST /api/auth/login
    // @access  Public
    async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            res.json({
                _id: user._id,
                email: user.email,
                role: user.role,
                token: generateToken(user)
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    },

    // @desc    Get user profile
    // @route   GET /api/auth/profile
    // @access  Private
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user._id);
            if (user) {
                res.json({
                    _id: user._id,
                    email: user.email,
                    role: user.role
                });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    },

    // @desc    Get all users (Admin only)
    // @route   GET /api/auth/users
    // @access  Private (Admin)
    async getAllUsers(req, res) {
        try {
            const users = await User.find({}, '-password').sort('-createdAt');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    },

    // @desc    Update user role (Admin only)
    // @route   PUT /api/auth/users/:id
    // @access  Private (Admin)
    async updateUserRole(req, res) {
        try {
            const { role } = req.body;
            const user = await User.findById(req.params.id);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.role = role;
            await user.save();

            res.json({
                _id: user._id,
                email: user.email,
                role: user.role
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    },

    // @desc    Delete user (Admin only)
    // @route   DELETE /api/auth/users/:id
    // @access  Private (Admin)
    async deleteUser(req, res) {
        try {
            const user = await User.findById(req.params.id);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            await User.findByIdAndDelete(req.params.id);
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = authController;