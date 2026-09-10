const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

// Module 13: Admin Occupancy Reports
// @route GET /api/admin/reports/occupancy?hotelId=&from=&to=
const getOccupancyReport = asyncHandler(async (req, res, next) => {
  const { hotelId, from, to } = req.query;
  if (!hotelId) return next(new AppError('hotelId query param is required', 400, 'VALIDATION_ERROR'));

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) return next(new AppError('Hotel not found', 404, 'NOT_FOUND'));

  const rangeStart = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 30));
  const rangeEnd = to ? new Date(to) : new Date();

  const roomTypes = await RoomType.find({ hotelId });
  const roomTypeIds = roomTypes.map((rt) => rt._id);
  const totalRooms = await Room.countDocuments({ roomTypeId: { $in: roomTypeIds } });

  const bookings = await Booking.find({
    hotelId,
    status: { $in: ['Confirmed', 'CheckedIn', 'CheckedOut'] },
    checkIn: { $lt: rangeEnd },
    checkOut: { $gt: rangeStart },
  });

  const totalNightsInRange = totalRooms * Math.max(1, Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)));

  let bookedNights = 0;
  let revenue = 0;
  for (const b of bookings) {
    const overlapStart = new Date(Math.max(new Date(b.checkIn), rangeStart));
    const overlapEnd = new Date(Math.min(new Date(b.checkOut), rangeEnd));
    const nights = Math.max(0, Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)));
    bookedNights += nights;
    revenue += b.totalAmount;
  }

  const occupancyRate = totalNightsInRange > 0 ? Math.round((bookedNights / totalNightsInRange) * 10000) / 100 : 0;

  res.status(200).json({
    success: true,
    message: 'Occupancy/revenue report generated successfully',
    data: {
      hotelId,
      hotelName: hotel.name,
      rangeStart,
      rangeEnd,
      totalRooms,
      bookedNights,
      totalNightsInRange,
      occupancyRatePercent: occupancyRate,
      totalRevenue: Math.round(revenue * 100) / 100,
      totalBookings: bookings.length,
    },
  });
});

module.exports = { getOccupancyReport };
