const express = require('express');

const { registerValidator, loginValidator,forgetPasswordValidator,resetPasswordValidator } = require('../validators/authValidator');
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register',registerValidator, authController.register);
router.post('/login',loginValidator, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/logout',authenticateToken,authController.logout)
router.post('/resendVerifyEmail',authController.resendVerificationEmail)
router.post('/forget-password',forgetPasswordValidator,authController.forgetPassword)
router.post('/reset-password',resetPasswordValidator,authController.resetPassword)
module.exports = router;
