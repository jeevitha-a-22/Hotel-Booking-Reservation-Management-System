const mongoose = require('mongoose');

// Design note: ownerId REFERENCES User (an admin can own/manage many hotels -> one-to-many).
// Not embedded because a hotel is large, independently updated, and shared across many
// roomType/booking documents that need to query it on its own.
const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    amenities: [{ type: String, trim: true }],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

hotelSchema.index({ name: 1 });
hotelSchema.index({ city: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);
