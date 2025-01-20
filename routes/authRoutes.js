const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/authController');
const {loginValidation, validate } = require("../validation/validator")
const {isAuthenticated} = require("../middleware/authMiddleware")


router.post('/login', validate(loginValidation), login);
router.post('/logout', isAuthenticated, logout)

module.exports = router;