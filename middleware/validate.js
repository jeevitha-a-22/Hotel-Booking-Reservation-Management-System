const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Run AFTER express-validator body()/query() chains to reject bad input
// with a clean 400 before it ever reaches business logic.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => `${e.path}: ${e.msg}`)
      .join('; ');
    return next(new AppError(message, 400, 'VALIDATION_ERROR'));
  }
  next();
};

module.exports = validate;
