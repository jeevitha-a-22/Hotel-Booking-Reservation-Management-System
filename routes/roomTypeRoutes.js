const express = require('express');
const { body } = require('express-validator');
const {
  createRoomType, getRoomTypes, getRoomTypeById, updateRoomType, deleteRoomType,
} = require('../controllers/roomTypeController');
const { getRoomsByRoomType } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('hotelId').isMongoId().withMessage('Valid hotelId is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('basePrice').isFloat({ min: 0 }).withMessage('basePrice must be a positive number'),
    body('totalRooms').isInt({ min: 0 }).withMessage('totalRooms must be a non-negative integer'),
    body('capacity').isInt({ min: 1 }).withMessage('capacity must be at least 1'),
  ],
  validate,
  createRoomType
);

router.get('/', getRoomTypes);
router.get('/:id', getRoomTypeById);
router.get('/:roomTypeId/rooms', getRoomsByRoomType);
router.put('/:id', protect, authorize('admin'), updateRoomType);
router.delete('/:id', protect, authorize('admin'), deleteRoomType);

module.exports = router;
