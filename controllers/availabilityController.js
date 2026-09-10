const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

// Module 4: Availability Search Engine
// @route GET /api/hotels/search?city=&checkIn=&checkOut=&occupancy=
const searchAvailability = asyncHandler(async (req, res, next) => {
  const { city, checkIn, checkOut, occupancy } = req.query;

  if (!checkIn || !checkOut) {
    return next(new AppError('checkIn and checkOut query params are required', 400, 'VALIDATION_ERROR'));
  }
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    return next(new AppError('Invalid date range: checkIn must be before checkOut', 400, 'VALIDATION_ERROR'));
  }

  const hotelFilter = { isActive: true };
  if (city) hotelFilter.city = new RegExp(city, 'i');
  const hotels = await Hotel.find(hotelFilter);
  const hotelIds = hotels.map((h) => h._id);

  const roomTypeFilter = { hotelId: { $in: hotelIds } };
  if (occupancy) roomTypeFilter.capacity = { $gte: Number(occupancy) };
  const roomTypes = await RoomType.find(roomTypeFilter);

  const results = [];
  for (const rt of roomTypes) {
    const totalRooms = await Room.countDocuments({ roomTypeId: rt._id });

    // Date-range conflict check: two ranges overlap when
    // existingStart < newEnd AND existingEnd > newStart
    const overlappingBookings = await Booking.countDocuments({
      roomTypeId: rt._id,
      status: { $in: ['Reserved', 'Confirmed', 'CheckedIn'] },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });

    const availableRooms = totalRooms - overlappingBookings;
    if (availableRooms > 0) {
      const hotel = hotels.find((h) => String(h._id) === String(rt.hotelId));
      results.push({
        hotel: { _id: hotel._id, name: hotel.name, city: hotel.city, rating: hotel.rating },
        roomType: { _id: rt._id, name: rt.name, basePrice: rt.basePrice, capacity: rt.capacity },
        availableRooms,
      });
    }
  }

  res.status(200).json({ success: true, message: 'Availability fetched successfully', data: results });
});

module.exports = { searchAvailability };
