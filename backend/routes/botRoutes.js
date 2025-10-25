const express = require('express');
const botController = require('../controllers/botController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Protect all routes and ensure bot role
router.use(protect);
router.use(roleMiddleware('bot'));

router.post('/process', botController.processApplications);

module.exports = router;