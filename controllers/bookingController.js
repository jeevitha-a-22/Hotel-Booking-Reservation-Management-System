const Booking = require('../models/Booking');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { calculateStayCost, calculateInvoice } = require('../utils/pricing');
const { getRefundPolicy } = require('../utils/cancellation');
const { canTransition } = require('../utils/bookingStateMachine');

// Module 5: Reservation Booking Workflow
// @route POST /api/bookings
const createBooking = asyncHandler(async (req, res, next) => {
  const { roomTypeId, checkIn, checkOut, occupancy, addOns } = req.body;

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    return next(new AppError('Invalid date range: checkIn must be before checkOut', 400, 'VALIDATION_ERROR'));
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start < today) {
    return next(new AppError('checkIn date cannot be in the past', 400, 'VALIDATION_ERROR'));
  }

  const roomType = await RoomType.findById(roomTypeId);
  if (!roomType) return next(new AppError('Room type not found', 404, 'NOT_FOUND'));

  if (occupancy && occupancy > roomType.capacity) {
    return next(new AppError('Occupancy exceeds room type capacity', 400, 'VALIDATION_ERROR'));
  }

  const totalRooms = await Room.countDocuments({ roomTypeId });

  // Core business rule: date-range conflict validation. Reject if every room of
  // this type is already booked (Reserved/Confirmed/CheckedIn) for an overlapping range.
  const overlappingBookings = await Booking.countDocuments({
    roomTypeId,
    status: { $in: ['Reserved', 'Confirmed', 'CheckedIn'] },
    checkIn: { $lt: end },
    checkOut: { $gt: start },
  });

  if (overlappingBookings >= totalRooms) {
    return next(new AppError('No rooms available for the selected date range', 409, 'ROOM_UNAVAILABLE'));
  }

  const { subtotal } = await calculateStayCost(roomType, start, end);
  const invoice = calculateInvoice(subtotal, addOns);

  const booking = await Booking.create({
    guestId: req.user._id,
    hotelId: roomType.hotelId,
    roomTypeId,
    checkIn: start,
    checkOut: end,
    occupancy: occupancy || 1,
    status: 'Reserved',
    totalAmount: invoice.total,
    addOns: addOns || [],
  });

  res.status(201).json({ success: true, message: 'Record created successfully', data: booking });
});

// Module 11: Guest Booking History
// @route GET /api/guests/:id/bookings
const getGuestBookings = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'guest' && String(req.user._id) !== String(req.params.id)) {
    return next(new AppError('Forbidden: you can only view your own bookings', 403, 'FORBIDDEN'));
  }

  const filter = { guestId: req.params.id };
  if (req.query.status) filter.status = req.query.status;

  const bookings = await Booking.find(filter)
    .populate('hotelId', 'name city')
    .populate('roomTypeId', 'name basePrice')
    .sort({ checkIn: -1 });

  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.checkIn) >= now && b.status !== 'Cancelled');
  const past = bookings.filter((b) => new Date(b.checkIn) < now || b.status === 'Cancelled');

  res.status(200).json({
    success: true,
    message: 'Guest booking history fetched successfully',
    data: { upcoming, past },
  });
});

// @route GET /api/bookings/:id
const getBookingById = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('hotelId', 'name city')
    .populate('roomTypeId', 'name basePrice');
  if (!booking) return next(new AppError('Booking not found', 404, 'NOT_FOUND'));

  if (req.user.role === 'guest' && String(booking.guestId) !== String(req.user._id)) {
    return next(new AppError('Forbidden: not your booking', 403, 'FORBIDDEN'));
  }
  res.status(200).json({ success: true, message: 'Booking fetched successfully', data: booking });
});

// Module 7: Booking Status Management (generic explicit transition, staff/admin only)
// @route PUT /api/bookings/:id/status
const updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404, 'NOT_FOUND'));

  if (!canTransition(booking.status, status)) {
    return next(
      new AppError(
        `Cannot transition booking from '${booking.status}' to '${status}'`,
        409,
        'INVALID_STATUS_TRANSITION'
      )
    );
  }

  booking.status = status;
  await booking.save();
  res.status(200).json({ success: true, message: 'Status updated successfully', data: { status: booking.status } });
});

// Module 8: Check-in / Check-out Module
// @route PUT /api/bookings/:id/checkin
const checkInBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404, 'NOT_FOUND'));

  if (!canTransition(booking.status, 'CheckedIn')) {
    return next(
      new AppError(`Cannot check in a booking with status '${booking.status}'`, 409, 'INVALID_STATUS_TRANSITION')
    );
  }

  if (!booking.roomId) {
    const rooms = await Room.find({ roomTypeId: booking.roomTypeId });
    const busyRoomIds = (
      await Booking.find({
        roomTypeId: booking.roomTypeId,
        status: 'CheckedIn',
        _id: { $ne: booking._id },
      }).distinct('roomId')
    ).map(String);

    const freeRoom = rooms.find((r) => !busyRoomIds.includes(String(r._id)));
    if (!freeRoom) return next(new AppError('No physical room available to check in', 409, 'ROOM_UNAVAILABLE'));
    booking.roomId = freeRoom._id;
  }

  booking.status = 'CheckedIn';
  booking.actualCheckInAt = new Date();
  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: { status: booking.status, roomId: booking.roomId, actualCheckInAt: booking.actualCheckInAt },
  });
});

// @route PUT /api/bookings/:id/checkout
const checkOutBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404, 'NOT_FOUND'));

  if (!canTransition(booking.status, 'CheckedOut')) {
    return next(
      new AppError(`Cannot check out a booking with status '${booking.status}'`, 409, 'INVALID_STATUS_TRANSITION')
    );
  }

  booking.status = 'CheckedOut';
  booking.actualCheckOutAt = new Date();
  await booking.save();

  // Module 9 hook: checking out automatically flags the physical room for housekeeping.
  if (booking.roomId) {
    await Room.findByIdAndUpdate(booking.roomId, { housekeepingStatus: 'Dirty' });
  }

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: { status: booking.status, actualCheckOutAt: booking.actualCheckOutAt },
  });
});

// Module 10: Cancellation & Refund Policy Engine
// @route PUT /api/bookings/:id/cancel
const cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404, 'NOT_FOUND'));

  if (req.user.role === 'guest' && String(booking.guestId) !== String(req.user._id)) {
    return next(new AppError('Forbidden: not your booking', 403, 'FORBIDDEN'));
  }

  if (!canTransition(booking.status, 'Cancelled')) {
    return next(
      new AppError(`Cannot cancel a booking with status '${booking.status}'`, 409, 'INVALID_STATUS_TRANSITION')
    );
  }

  const { refundPercentage, reason } = getRefundPolicy(booking.checkIn);
  const refundAmount = Math.round(((booking.totalAmount * refundPercentage) / 100) * 100) / 100;

  booking.status = 'Cancelled';
  booking.cancellation = { cancelledAt: new Date(), refundAmount, refundPercentage, reason };
  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: { status: booking.status, refundAmount, refundPercentage, reason },
  });
});

// Module 12: Invoice Generation Summary
// @route GET /api/bookings/:id/invoice
const getInvoice = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('roomTypeId', 'name basePrice');
  if (!booking) return next(new AppError('Booking not found', 404, 'NOT_FOUND'));

  if (req.user.role === 'guest' && String(booking.guestId) !== String(req.user._id)) {
    return next(new AppError('Forbidden: not your booking', 403, 'FORBIDDEN'));
  }

  const { subtotal, nights } = await calculateStayCost(booking.roomTypeId, booking.checkIn, booking.checkOut);
  const invoice = calculateInvoice(subtotal, booking.addOns);

  res.status(200).json({
    success: true,
    message: 'Invoice generated successfully',
    data: {
      bookingId: booking._id,
      roomType: booking.roomTypeId.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights,
      ...invoice,
    },
  });
});

module.exports = {
  createBooking,
  getGuestBookings,
  getBookingById,
  updateBookingStatus,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  getInvoice,
};
