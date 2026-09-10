const mongoose = require('mongoose');

// Design note: roomTypeId REFERENCE - rooms are updated independently and frequently
// (housekeeping status changes many times a day), so embedding inside roomType would
// cause excessive whole-document rewrites.
const roomSchema = new mongoose.Schema(
  {
    roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    roomNumber: { type: String, required: true, trim: true },
    housekeepingStatus: {
      type: String,
      enum: ['Clean', 'Dirty', 'Inspected', 'OutOfService'],
      default: 'Clean',
    },
  },
  { timestamps: true }
);

roomSchema.index({ roomTypeId: 1 });
roomSchema.index({ roomTypeId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
