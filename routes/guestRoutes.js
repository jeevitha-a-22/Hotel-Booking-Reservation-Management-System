const express = require('express');
const { getGuestBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Module 11: Guest Booking History
router.get('/:id/bookings', protect, getGuestBookings);

module.exports = router;
