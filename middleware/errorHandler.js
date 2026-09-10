class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || 'ERROR';
  }
}

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404, 'NOT_FOUND'));
};

// Centralized Express error-handling middleware: ALWAYS returns clean JSON,
// never lets an unhandled error crash the process or leak a stack trace.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errorCode = err.errorCode || 'SERVER_ERROR';

  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found (invalid id)';
    errorCode = 'NOT_FOUND';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    errorCode = 'VALIDATION_ERROR';
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value for a unique field';
    errorCode = 'DUPLICATE_KEY';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
  });
};

module.exports = { AppError, notFound, errorHandler };
