const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/authController');
const {loginValidation, validate } = require("../validation/validator")


router.post('/login', validate(loginValidation), login);
router.post('/logout', logout)

module.exports = router;