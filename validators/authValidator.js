const { body } = require('express-validator');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registerValidator = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .matches(passwordRegex)
    .withMessage(
      'Password should be a combination of one uppercase, one lowercase, one special character, one digit, and be between 8 and 20 characters long'
    )
];

const loginValidator = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgetPasswordValidator = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidator = [
  body('token')
    .notEmpty()
    .withMessage('Token is required')
    .isString()
    .withMessage('Token must be a valid string'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .matches(passwordRegex)
    .withMessage(
      'Password should be a combination of one uppercase, one lowercase, one special character, one digit, and be between 8 and 20 characters long'
    )
];

const changePasswordValidator = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Please enter your old password'),

  body('newPassword')
    .notEmpty()
    .withMessage('Please enter a new password')
    .matches(passwordRegex)
    .withMessage(
      'Password should be a combination of one uppercase, one lowercase, one special character, one digit, and be between 8 and 20 characters long'
    )
];

module.exports = {
  registerValidator,
  loginValidator,
  forgetPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator
};
