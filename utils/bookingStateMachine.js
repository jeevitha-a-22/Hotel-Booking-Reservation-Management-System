// Module 7: Booking Status Management - explicit allowed transitions.
// Reserved -> Confirmed -> CheckedIn -> CheckedOut
//    \--------------------> Cancelled (from Reserved or Confirmed only)
const ALLOWED_TRANSITIONS = {
  Reserved: ['Confirmed', 'Cancelled'],
  Confirmed: ['CheckedIn', 'Cancelled'],
  CheckedIn: ['CheckedOut'],
  CheckedOut: [],
  Cancelled: [],
};

const canTransition = (from, to) =>
  Array.isArray(ALLOWED_TRANSITIONS[from]) && ALLOWED_TRANSITIONS[from].includes(to);

module.exports = { ALLOWED_TRANSITIONS, canTransition };
