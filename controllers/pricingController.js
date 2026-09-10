const PricingRule = require('../models/PricingRule');
const RoomType = require('../models/RoomType');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

// Module 6: Dynamic Pricing Rules
// @route POST /api/pricing-rules
const createPricingRule = asyncHandler(async (req, res, next) => {
  const { roomTypeId, season, startDate, endDate, dayOfWeek, multiplier } = req.body;
  const roomType = await RoomType.findById(roomTypeId);
  if (!roomType) return next(new AppError('Room type not found', 404, 'NOT_FOUND'));

  const rule = await PricingRule.create({ roomTypeId, season, startDate, endDate, dayOfWeek, multiplier });
  res.status(201).json({ success: true, message: 'Record created successfully', data: rule });
});

// @route GET /api/pricing-rules?roomTypeId=
const getPricingRules = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.roomTypeId) filter.roomTypeId = req.query.roomTypeId;
  const rules = await PricingRule.find(filter);
  res.status(200).json({ success: true, message: 'Pricing rules fetched successfully', data: rules });
});

// @route PUT /api/pricing-rules/:id
const updatePricingRule = asyncHandler(async (req, res, next) => {
  const rule = await PricingRule.findById(req.params.id);
  if (!rule) return next(new AppError('Pricing rule not found', 404, 'NOT_FOUND'));

  const { season, startDate, endDate, dayOfWeek, multiplier } = req.body;
  if (season !== undefined) rule.season = season;
  if (startDate !== undefined) rule.startDate = startDate;
  if (endDate !== undefined) rule.endDate = endDate;
  if (dayOfWeek !== undefined) rule.dayOfWeek = dayOfWeek;
  if (multiplier !== undefined) rule.multiplier = multiplier;

  await rule.save();
  res.status(200).json({ success: true, message: 'Status updated successfully', data: rule });
});

// @route DELETE /api/pricing-rules/:id
const deletePricingRule = asyncHandler(async (req, res, next) => {
  const rule = await PricingRule.findById(req.params.id);
  if (!rule) return next(new AppError('Pricing rule not found', 404, 'NOT_FOUND'));
  await PricingRule.deleteOne({ _id: rule._id });
  res.status(200).json({ success: true, message: 'Pricing rule deleted successfully', data: null });
});

module.exports = { createPricingRule, getPricingRules, updatePricingRule, deletePricingRule };
