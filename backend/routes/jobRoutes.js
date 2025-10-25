const express = require('express');
const jobController = require('../controllers/jobController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Public routes (for authenticated users)
router.get('/active', jobController.getActiveJobs);
router.get('/:id', jobController.getJobById);

// Admin only routes
router.get('/', roleMiddleware('admin'), jobController.getAllJobs);
router.post('/', roleMiddleware('admin'), jobController.createJob);
router.put('/:id', roleMiddleware('admin'), jobController.updateJob);
router.delete('/:id', roleMiddleware('admin'), jobController.deleteJob);
router.get('/stats/overview', roleMiddleware('admin'), jobController.getJobStats);
router.get('/:id/applications', roleMiddleware('admin'), jobController.getJobApplications);

module.exports = router;