const mongoose = require('mongoose');

const BOOKING_STATUSES = ['Reserved', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'];

// Design note: addOns[] is EMBEDDED (small sub-array, always read together with the
// booking, never queried independently, rarely updated after creation).
// guestId/hotelId/roomTypeId/roomId are REFERENCES (large, shared, independently updated docs).
const bookingSchema = new mongoose.Schema(
  {
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    occupancy: { type: Number, required: true, min: 1 },
    status: { type: String, enum: BOOKING_STATUSES, default: 'Reserved' },
    totalAmount: { type: Number, required: true, min: 0 },
    addOns: [
      {
        name: { type: String, trim: true },
        amount: { type: Number, min: 0 },
      },
    ],
    actualCheckInAt: { type: Date },
    actualCheckOutAt: { type: Date },
    cancellation: {
      cancelledAt: { type: Date },
      refundAmount: { type: Number },
      refundPercentage: { type: Number },
      reason: { type: String },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ guestId: 1 });
bookingSchema.index({ roomTypeId: 1, checkIn: 1, checkOut: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
Booking.BOOKING_STATUSES = BOOKING_STATUSES;

module.exports = Booking;
