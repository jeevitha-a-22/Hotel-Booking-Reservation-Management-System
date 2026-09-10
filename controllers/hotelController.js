const Hotel = require('../models/Hotel');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const getPagination = require('../utils/pagination');

// Module 2: Hotel & Property Management
// @route POST /api/hotels
const createHotel = asyncHandler(async (req, res) => {
  const { name, city, address, amenities, rating } = req.body;
  const hotel = await Hotel.create({
    name,
    city,
    address,
    amenities,
    rating,
    ownerId: req.user._id,
  });
  res.status(201).json({ success: true, message: 'Record created successfully', data: hotel });
});

// @route GET /api/hotels
const getHotels = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = { isActive: true };
  if (req.query.city) filter.city = new RegExp(req.query.city, 'i');

  const [hotels, total] = await Promise.all([
    Hotel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Hotel.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Hotels fetched successfully',
    data: hotels,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// @route GET /api/hotels/:id
const getHotelById = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return next(new AppError('Hotel not found', 404, 'NOT_FOUND'));
  res.status(200).json({ success: true, message: 'Hotel fetched successfully', data: hotel });
});

// @route PUT /api/hotels/:id  (admin, or the owning admin only)
const updateHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return next(new AppError('Hotel not found', 404, 'NOT_FOUND'));

  if (req.user.role !== 'admin' || String(hotel.ownerId) !== String(req.user._id)) {
    // super-admins could be modeled separately; here we require exact ownership
    return next(new AppError('Forbidden: you do not own this hotel', 403, 'FORBIDDEN'));
  }

  const { name, city, address, amenities, rating, isActive } = req.body;
  if (name !== undefined) hotel.name = name;
  if (city !== undefined) hotel.city = city;
  if (address !== undefined) hotel.address = address;
  if (amenities !== undefined) hotel.amenities = amenities;
  if (rating !== undefined) hotel.rating = rating;
  if (isActive !== undefined) hotel.isActive = isActive;

  await hotel.save();
  res.status(200).json({ success: true, message: 'Status updated successfully', data: hotel });
});

// @route DELETE /api/hotels/:id  (soft delete - deactivate)
const deleteHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return next(new AppError('Hotel not found', 404, 'NOT_FOUND'));

  if (String(hotel.ownerId) !== String(req.user._id)) {
    return next(new AppError('Forbidden: you do not own this hotel', 403, 'FORBIDDEN'));
  }

  hotel.isActive = false;
  await hotel.save();
  res.status(200).json({ success: true, message: 'Hotel deactivated successfully', data: null });
});

module.exports = { createHotel, getHotels, getHotelById, updateHotel, deleteHotel };
