const express = require('express');
const { getOccupancyReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Module 13: Admin Occupancy Reports
router.get('/reports/occupancy', protect, authorize('admin'), getOccupancyReport);

module.exports = router;
