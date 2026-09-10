const Room = require('../models/Room');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

// @route GET /api/roomtypes/:roomTypeId/rooms
const getRoomsByRoomType = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ roomTypeId: req.params.roomTypeId });
  res.status(200).json({ success: true, message: 'Rooms fetched successfully', data: rooms });
});

// Module 9: Housekeeping Status Tracking
// @route PUT /api/rooms/:id/housekeeping
const updateHousekeepingStatus = asyncHandler(async (req, res, next) => {
  const { housekeepingStatus } = req.body;
  const validStatuses = ['Clean', 'Dirty', 'Inspected', 'OutOfService'];
  if (!validStatuses.includes(housekeepingStatus)) {
    return next(
      new AppError(`housekeepingStatus must be one of: ${validStatuses.join(', ')}`, 400, 'VALIDATION_ERROR')
    );
  }

  const room = await Room.findById(req.params.id);
  if (!room) return next(new AppError('Room not found', 404, 'NOT_FOUND'));

  room.housekeepingStatus = housekeepingStatus;
  await room.save();

  res.status(200).json({ success: true, message: 'Status updated successfully', data: room });
});

module.exports = { getRoomsByRoomType, updateHousekeepingStatus };
