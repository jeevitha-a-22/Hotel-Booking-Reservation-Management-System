const mongoose = require('mongoose');

// Design note: roomTypeId REFERENCE - pricing rules are managed and queried independently
// of the roomType (admins edit seasonal rules often without touching the roomType doc).
const pricingRuleSchema = new mongoose.Schema(
  {
    roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    season: { type: String, required: true, trim: true }, // e.g. 'Summer', 'Winter', 'Weekend'
    startDate: { type: Date },
    endDate: { type: Date },
    dayOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sunday, used for weekend-style rules
    multiplier: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

pricingRuleSchema.index({ roomTypeId: 1 });

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
