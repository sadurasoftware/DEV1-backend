const { body , validationResult} = require('express-validator');

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

const registerValidation = [
  body('username')
            .notEmpty()
            .withMessage('Username is required'),
  body('email')
             .notEmpty().withMessage('Email is required')
             .isEmail().withMessage('Invalid email format'),
  body('password')
              .notEmpty().withMessage('Password is required')
              .isLength({ min: 6 })
              .withMessage('Password must be at least 6 characters long'),
  body('terms')
             .isBoolean().withMessage('Terms must be a boolean').custom(value => value === true)
             .withMessage('You must accept the terms and conditions')
];


module.exports = { registerValidation, validate };
