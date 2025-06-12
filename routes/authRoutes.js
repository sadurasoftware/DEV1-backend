const express = require('express');
const router = express.Router();
const validator = require('../validator/router-validator');
const authController = require('../controllers/authController');
const {authenticateToken,} = require('../middlewares/authMiddleware');


router.post('/register',validator.registerValidator,authController.register);
router.post('/login', validator.loginValidator,authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/logout',authenticateToken,authController.logout)
router.post('/resendVerifyEmail', validator.resendVerifyEmailValidator,authController.resendVerificationEmail)
router.post('/forget-password',validator.forgetPasswordValidator,authController.forgetPassword)
router.get('/reset-password',authController.getResetPassword)
router.post('/reset-password',validator.resetPasswordValidator,authController.resetPassword)
router.post('/change-password',authenticateToken,validator.changePasswordValidator,authController.changePassword)
router.post('/set-password/:token',authController.setPassword)
module.exports = router;
