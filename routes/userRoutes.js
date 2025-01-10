const express = require('express');
const {registerUser} = require('../controllers/userController')
const {registerValidation, validate} = require('../validation/registerValidation');

const router = express.Router();


// Register route
router.post('/register', validate(registerValidation), registerUser);

module.exports = router;