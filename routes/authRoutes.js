const express = require('express');
const router = express.Router();
const { loginValidator,forgetPasswordValidator,resetPasswordValidator,changePasswordValidator } = require('../validator/router-validator');
const authController = require('../controllers/authController');
const {authenticateToken,} = require('../middlewares/authMiddleware');


router.post('/register', authController.register);
router.post('/login',loginValidator, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/logout',authenticateToken,authController.logout)
router.post('/resendVerifyEmail',authController.resendVerificationEmail)
router.post('/forget-password',forgetPasswordValidator,authController.forgetPassword)
router.get('/reset-password',authController.getResetPassword)
router.post('/reset-password',resetPasswordValidator,authController.resetPassword)
router.post('/change-password',authenticateToken,changePasswordValidator,authController.changePassword)
module.exports = router;
