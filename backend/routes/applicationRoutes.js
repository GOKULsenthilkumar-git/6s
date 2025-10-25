const express = require('express');
const applicationController = require('../controllers/applicationController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Public routes (for authenticated users)
router.post('/', applicationController.createApplication);
router.get('/my', applicationController.getUserApplications);

// Admin only routes
router.get('/', roleMiddleware('admin'), applicationController.getAllApplications);
router.get('/stats', roleMiddleware('admin'), applicationController.getStats);
router.get('/bot-activities', roleMiddleware('admin'), applicationController.getBotActivities);
router.post('/trigger-ai-process', roleMiddleware('admin'), applicationController.triggerAIProcessing);
router.post('/create-sample-activities', roleMiddleware('admin'), applicationController.createSampleActivities);

// Admin routes only (no more bot role needed)
router.put(
    '/:id',
    roleMiddleware('admin'),
    applicationController.updateApplication
);

module.exports = router;