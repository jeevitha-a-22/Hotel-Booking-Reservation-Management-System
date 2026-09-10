const mongoose = require('mongoose');

// Design note: hotelId is a REFERENCE (many roomTypes belong to one hotel; hotel doc
// would grow unbounded if roomTypes were embedded, and roomTypes are queried independently).
const roomTypeSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    name: { type: String, required: true, trim: true },
    basePrice: { type: Number, required: true, min: 0 },
    totalRooms: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    amenities: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

roomTypeSchema.index({ hotelId: 1 });

module.exports = mongoose.model('RoomType', roomTypeSchema);
