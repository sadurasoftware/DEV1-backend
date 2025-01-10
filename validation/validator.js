const { body, validationResult } = require('express-validator');

const validate = (rules) => [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];

const loginValidation = [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
  ];

module.exports = {validate, loginValidation};