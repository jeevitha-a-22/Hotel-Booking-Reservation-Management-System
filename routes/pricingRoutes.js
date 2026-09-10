const express = require('express');
const { body } = require('express-validator');
const {
  createPricingRule, getPricingRules, updatePricingRule, deletePricingRule,
} = require('../controllers/pricingController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('roomTypeId').isMongoId().withMessage('Valid roomTypeId is required'),
    body('season').trim().notEmpty().withMessage('season is required'),
    body('multiplier').isFloat({ min: 0 }).withMessage('multiplier must be a positive number'),
  ],
  validate,
  createPricingRule
);

router.get('/', getPricingRules);
router.put('/:id', protect, authorize('admin'), updatePricingRule);
router.delete('/:id', protect, authorize('admin'), deletePricingRule);

module.exports = router;
