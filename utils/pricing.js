const PricingRule = require('../models/PricingRule');

// Single currency/locale/timezone assumption (documented in README).
const TAX_RATE = 0.12;

const nightsBetween = (checkIn, checkOut) => {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

// Module 6: Dynamic Pricing Rules - pick the highest-applicable multiplier for a given night.
const getMultiplierForDate = async (roomTypeId, date) => {
  const rules = await PricingRule.find({ roomTypeId });
  const d = new Date(date);
  const dow = d.getDay();

  let bestMultiplier = 1;

  for (const rule of rules) {
    let matches = false;
    if (rule.startDate && rule.endDate && d >= new Date(rule.startDate) && d <= new Date(rule.endDate)) {
      matches = true;
    }
    if (rule.dayOfWeek && rule.dayOfWeek.length > 0 && rule.dayOfWeek.includes(dow)) {
      matches = true;
    }
    if (matches && rule.multiplier > bestMultiplier) {
      bestMultiplier = rule.multiplier;
    }
  }
  return bestMultiplier;
};

// Sums per-night price (basePrice * applicable multiplier) across the stay.
const calculateStayCost = async (roomType, checkIn, checkOut) => {
  const nights = nightsBetween(checkIn, checkOut);
  let subtotal = 0;
  const cursor = new Date(checkIn);
  for (let i = 0; i < nights; i++) {
    const multiplier = await getMultiplierForDate(roomType._id, cursor);
    subtotal += roomType.basePrice * multiplier;
    cursor.setDate(cursor.getDate() + 1);
  }
  return { nights, subtotal: Math.round(subtotal * 100) / 100 };
};

// Module 12: Invoice Generation Summary
const calculateInvoice = (subtotal, addOns = []) => {
  const addOnsTotal = addOns.reduce((sum, a) => sum + (a.amount || 0), 0);
  const taxableAmount = subtotal + addOnsTotal;
  const tax = Math.round(taxableAmount * TAX_RATE * 100) / 100;
  const total = Math.round((taxableAmount + tax) * 100) / 100;
  return { subtotal, addOnsTotal, tax, taxRate: TAX_RATE, total };
};

module.exports = { nightsBetween, getMultiplierForDate, calculateStayCost, calculateInvoice, TAX_RATE };
