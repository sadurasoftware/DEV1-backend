const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const {loginValidation, validate } = require("../validation/validator")


router.post('/login', validate(loginValidation), login);

module.exports = router;