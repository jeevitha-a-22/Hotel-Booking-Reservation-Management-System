const RoomType = require('../models/RoomType');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

// Module 3: Room Type & Inventory Management
// @route POST /api/roomtypes
const createRoomType = asyncHandler(async (req, res, next) => {
  const { hotelId, name, basePrice, totalRooms, capacity, amenities } = req.body;
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) return next(new AppError('Hotel not found', 404, 'NOT_FOUND'));

  if (String(hotel.ownerId) !== String(req.user._id)) {
    return next(new AppError('Forbidden: you do not own this hotel', 403, 'FORBIDDEN'));
  }

  const roomType = await RoomType.create({ hotelId, name, basePrice, totalRooms, capacity, amenities });

  // Auto-generate the individual Room documents (module 3's per-room attributes)
  // to match totalRooms, so inventory count and physical rooms never drift apart.
  const rooms = [];
  for (let i = 1; i <= totalRooms; i++) {
    rooms.push({ roomTypeId: roomType._id, roomNumber: `${name.slice(0, 2).toUpperCase()}-${i}` });
  }
  if (rooms.length) await Room.insertMany(rooms);

  res.status(201).json({ success: true, message: 'Record created successfully', data: roomType });
});

// @route GET /api/roomtypes?hotelId=
const getRoomTypes = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.hotelId) filter.hotelId = req.query.hotelId;
  const roomTypes = await RoomType.find(filter).populate('hotelId', 'name city');
  res.status(200).json({ success: true, message: 'Room types fetched successfully', data: roomTypes });
});

// @route GET /api/roomtypes/:id
const getRoomTypeById = asyncHandler(async (req, res, next) => {
  const roomType = await RoomType.findById(req.params.id).populate('hotelId', 'name city');
  if (!roomType) return next(new AppError('Room type not found', 404, 'NOT_FOUND'));
  res.status(200).json({ success: true, message: 'Room type fetched successfully', data: roomType });
});

// @route PUT /api/roomtypes/:id
const updateRoomType = asyncHandler(async (req, res, next) => {
  const roomType = await RoomType.findById(req.params.id);
  if (!roomType) return next(new AppError('Room type not found', 404, 'NOT_FOUND'));

  const hotel = await Hotel.findById(roomType.hotelId);
  if (!hotel || String(hotel.ownerId) !== String(req.user._id)) {
    return next(new AppError('Forbidden: you do not own this hotel', 403, 'FORBIDDEN'));
  }

  const { name, basePrice, capacity, amenities } = req.body;
  if (name !== undefined) roomType.name = name;
  if (basePrice !== undefined) roomType.basePrice = basePrice;
  if (capacity !== undefined) roomType.capacity = capacity;
  if (amenities !== undefined) roomType.amenities = amenities;
  // totalRooms is intentionally not editable here - changing inventory count
  // requires adding/removing Room documents explicitly, not a blind overwrite.

  await roomType.save();
  res.status(200).json({ success: true, message: 'Status updated successfully', data: roomType });
});

// @route DELETE /api/roomtypes/:id
const deleteRoomType = asyncHandler(async (req, res, next) => {
  const roomType = await RoomType.findById(req.params.id);
  if (!roomType) return next(new AppError('Room type not found', 404, 'NOT_FOUND'));

  const hotel = await Hotel.findById(roomType.hotelId);
  if (!hotel || String(hotel.ownerId) !== String(req.user._id)) {
    return next(new AppError('Forbidden: you do not own this hotel', 403, 'FORBIDDEN'));
  }

  await RoomType.deleteOne({ _id: roomType._id });
  await Room.deleteMany({ roomTypeId: roomType._id });
  res.status(200).json({ success: true, message: 'Room type deleted successfully', data: null });
});

module.exports = { createRoomType, getRoomTypes, getRoomTypeById, updateRoomType, deleteRoomType };
