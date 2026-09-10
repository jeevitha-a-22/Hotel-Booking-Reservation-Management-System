// Module 10: Cancellation & Refund Policy Engine
// Refund percentage scales with how close to check-in the cancellation happens.
const getRefundPolicy = (checkInDate, now = new Date()) => {
  const hoursToCheckIn = (new Date(checkInDate) - now) / (1000 * 60 * 60);

  if (hoursToCheckIn >= 168) {
    return { refundPercentage: 100, reason: 'Cancelled 7+ days before check-in' };
  }
  if (hoursToCheckIn >= 72) {
    return { refundPercentage: 75, reason: 'Cancelled 3-7 days before check-in' };
  }
  if (hoursToCheckIn >= 24) {
    return { refundPercentage: 50, reason: 'Cancelled 1-3 days before check-in' };
  }
  if (hoursToCheckIn >= 0) {
    return { refundPercentage: 0, reason: 'Cancelled less than 24 hours before check-in' };
  }
  return { refundPercentage: 0, reason: 'Cancelled after the scheduled check-in date' };
};

module.exports = { getRefundPolicy };
