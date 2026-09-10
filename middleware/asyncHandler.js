// Wraps async route handlers so rejected promises/thrown errors are forwarded
// to the centralized error handler instead of crashing the server.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
