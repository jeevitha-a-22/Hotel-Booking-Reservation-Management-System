const express = require('express');
const { body } = require('express-validator');
const {
  createHotel, getHotels, getHotelById, updateHotel, deleteHotel,
} = require('../controllers/hotelController');
const { searchAvailability } = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Module 4: public availability search - must be declared BEFORE '/:id'
router.get('/search', searchAvailability);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
  ],
  validate,
  createHotel
);

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.put('/:id', protect, authorize('admin'), updateHotel);
router.delete('/:id', protect, authorize('admin'), deleteHotel);

module.exports = router;
