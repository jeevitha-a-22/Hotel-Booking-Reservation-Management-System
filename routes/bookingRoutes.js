const express = require('express');
const { body } = require('express-validator');
const {
  createBooking, getBookingById, updateBookingStatus,
  checkInBooking, checkOutBooking, cancelBooking, getInvoice,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('guest', 'admin'),
  [
    body('roomTypeId').isMongoId().withMessage('Valid roomTypeId is required'),
    body('checkIn').isISO8601().withMessage('Valid checkIn date (ISO8601) is required'),
    body('checkOut').isISO8601().withMessage('Valid checkOut date (ISO8601) is required'),
  ],
  validate,
  createBooking
);

router.get('/:id', protect, getBookingById);
router.get('/:id/invoice', protect, getInvoice); // Module 12
router.put('/:id/status', protect, authorize('staff', 'admin'), updateBookingStatus); // Module 7
router.put('/:id/checkin', protect, authorize('staff', 'admin'), checkInBooking); // Module 8
router.put('/:id/checkout', protect, authorize('staff', 'admin'), checkOutBooking); // Module 8
router.put('/:id/cancel', protect, cancelBooking); // Module 10

module.exports = router;
