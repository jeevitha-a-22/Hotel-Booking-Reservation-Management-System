const express = require('express');
const { updateHousekeepingStatus } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Module 9: Housekeeping Status Tracking
router.put('/:id/housekeeping', protect, authorize('staff', 'admin'), updateHousekeepingStatus);

module.exports = router;
