const { User } = require('../models');
const { Role } = require('../models');
const { validationResult } = require('express-validator');
const bcryptHelper = require('../utils/bcryptHelper');
const jwtHelper = require('../utils/jwtHelper');
const logger = require('../config/logger');
const emailHelper = require('../utils/emailHelper');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const handleError = (res, error, message) => {
  logger.error(`${message}: ${error.message}`);
  return res.status(500).json({ message: 'Server error', error });
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed during registration');
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, email, password,role } = req.body;
    // if (password !== confirmPassword) {
    //   logger.warn(`Passwords do not match during registration: ${email}`);
    //   return res.status(400).json({ message: 'Passwords do not match' });
    // }
    
    logger.info(`Registering user: ${email}`);
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`Registration failed. User already exists: ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }
    const roleData = await Role.findOne({ where: { name: role } });
    if (!roleData) {
      logger.warn(`Invalid role provided during registration: ${role}`);
      return res.status(400).json({ message: 'Invalid role' });
    }
    const hashedPassword = await bcryptHelper.hashPassword(password);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      roleId: roleData.id,
    });
    const tokenPayload = { id: newUser.id, email: newUser.email, username: newUser.username };
    const token = jwtHelper.generateToken(tokenPayload, process.env.JWT_SECRET, '2m');
    const verificationUrl = `${process.env.VERIFICATION_URL}/verify-email/${token}`;
    await emailHelper.verificationEmail(email, verificationUrl, username);
    logger.info(`User registered successfully: ${email}`);
    return res.status(201).json({
      message: 'User created successfully. Please verify your email.',
      user: { id: newUser.id, username: newUser.username, email: newUser.email, token },
    });
  } catch (error) {
    return handleError(res, error, 'Registration error');
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    logger.info(`Resending verification email to: ${email}`);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Resend verification email failed. User not found: ${email}`);
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isVerified) {
      logger.info(`User already verified: ${email}`);
      return res.status(400).json({ error: 'User is already verified' });
    }
    const token = jwtHelper.generateToken({ email }, process.env.JWT_SECRET, '2m');
    const verificationUrl = `${process.env.VERIFICATION_URL}/verify-email/${token}`;
    await emailHelper.verificationEmail(email, verificationUrl, user.username);
    logger.info(`Verification email resent successfully: ${email}`);
    return res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    return handleError(res, error, 'Resend verification email error');
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed during login');
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    logger.info(`User login attempt: ${email}`);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Login failed. User not found: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.isVerified) {
      logger.warn(`Login failed. Email not verified: ${email}`);
      return res.status(403).json({ message: 'Email not verified. Please verify your email.' });
    }
    
    const isPasswordValid = await bcryptHelper.comparePassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Login failed. Invalid credentials: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const tokenPayload = { id: user.id, email: user.email ,roleId: user.roleId};
    const token = jwtHelper.generateToken(tokenPayload, process.env.JWT_SECRET, '1h');
    res.cookie('authToken', token, {
      httpOnly: true,      
      secure: true,
      sameSite: 'Strict',  
      maxAge: 1000 * 60 * 60, 
    });
    logger.info(`User logged in successfully: ${email}`);
    
      //   const roleData = await Role.findOne({ where: { id: user.roleId } });
      //   if (!roleData) {
      //   logger.warn(`Invalid role provided during registration: ${user.roleId}`);
      //   return res.status(400).json({ message: 'Invalid role' });
      // }
      console.log(user);
    return res.status(200).json({ token, user});
  } catch (error) {
    return handleError(res, error, 'Login error');
  }
};


const verifyEmail = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    logger.warn('Verification failed. Missing token');
    return res.status(400).json({ error: 'Token is missing' });
  }

  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    logger.info(`Verifying email for: ${email}`);
    
    const user = await User.findOne({ where: { email } });

    if (!user) {
      logger.warn(`Verification failed. User not found: ${email}`);
      return res.status(400).json({ error: 'Invalid token or user not found' });
    }

    if (user.isVerified) {
      logger.info(`Email already verified: ${email}`);
      return res.set("Content-Type", "text/html").send(
        Buffer.from(
          `<div style="text-align:center; font-family: Arial, sans-serif; padding: 20px;">
            <div style="display: inline-block; background-color: #e6f7e6; padding: 20px; border-radius: 10px; border: 2px solid #4CAF50; text-align: center; max-width: 400px;">
              <h2 style="color: #4CAF50; font-size: 24px; font-weight: bold;">
                Your email is already verified.
              </h2>
              <div style="font-size: 40px; color: #4CAF50; margin-bottom: 20px;">&#10004;</div>
              <a href="http://localhost:5173/login" 
                 style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 18px;">
                 Login
              </a>
            </div>
          </div>`
        )
      );
    }

    user.isVerified = true;
    await user.save();
    logger.info(`Email verified successfully: ${email}`);
    return res.set("Content-Type", "text/html").send(
      Buffer.from(
        `<div style="text-align:center; font-family: Arial, sans-serif; padding: 20px;">
          <div style="display: inline-block; background-color: #e6f7e6; padding: 20px; border-radius: 10px; border: 2px solid #4CAF50; text-align: center; max-width: 400px;">
            <h2 style="color: #4CAF50; font-size: 24px; font-weight: bold;">
              Your email is successfully verified. You can log in now.
            </h2>
            <div style="font-size: 40px; color: #4CAF50; margin-bottom: 20px;">&#10004;</div>
            <a href="http://localhost:5173/login" 
               style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 18px;">
               Login
            </a>
          </div>
        </div>`
      )
    );
    
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Verification failed. Token expired.');
      const { email } = jwt.decode(token);
      
      return res.set("Content-Type", "text/html").send(
        Buffer.from(
          `<div style="text-align:center; font-family: Arial, sans-serif; padding: 20px;">
            <div style="display: inline-block; background-color: #e6f7e6; padding: 20px; border-radius: 10px; border: 2px solid #FF6347; text-align: center; max-width: 400px;">
              <h2 style="color: #FF6347; font-size: 24px; font-weight: bold;">
                The token has expired. Please request a new verification email.
              </h2>
              <div style="font-size: 40px; color: #FF6347; margin-bottom: 20px;">&#10060;</div>
              <form action="/api/auth/resendVerifyEmail" method="POST">
                <input type="hidden" name="email" value="${email}">
                <button type="submit" style="background-color: #FF6347; color: white; padding: 10px 20px; border-radius: 5px; font-size: 18px;">
                  Resend Verification Email
                </button>
              </form>
            </div>
          </div>`
        )
      );
    }
    
    return handleError(res, error, 'Verify email error');
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    logger.warn('Forget password failed. Missing email');
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    logger.info(`Forget password request for: ${email}`);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Forget password failed. User not found: ${email}`);
      return res.status(404).json({ error: 'User not found' });
    }
    const token = jwtHelper.generateToken({ email }, process.env.JWT_SECRET, '1h');
    const url = `${process.env.FORGET_PASSWORD_URL}?token=${token}`;
    await emailHelper.forgotPasswordEmail(user.email, url, user.username);
    logger.info(`Password reset link sent successfully to: ${email}`);
    return res.status(200).json({ message: 'Password reset link sent successfully' });
  } catch (error) {
    return handleError(res, error, 'Forget password error');
  }
};

const getResetPassword = async (req, res) => {
  const { token } = req.query; 
  if (!token) {
    logger.warn('Reset password failed. Missing token');
    return res.status(400).json({ message: 'Token is required to reset password.' });
  }
  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    logger.info(`Token verified for: ${email}`);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Reset password failed. User not found: ${email}`);
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.redirect(`http://localhost:5173/reset-password?token=${token}`);
   
  } catch (error) {
    logger.error('Error verifying reset password token', error);
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    logger.warn('Reset password failed. Missing token or new password');
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    logger.info(`Resetting password for: ${email}`);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Reset password failed. User not found: ${email}`);
      return res.status(404).json({ message: 'User not found.' });
    }
    const hashedPassword = await bcryptHelper.hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
    logger.info(`Password reset successfully for: ${email}`);
    return res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    return handleError(res, error, 'Reset password error');
  }
};
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    logger.warn('Change Password failed. Missing oldpassword and newPassword');
    return res.status(400).json({ message: 'Old password and new password are required.' });
  }
  try {
    const userId = req.user.id; 
    const user = await User.findByPk(userId);
    if (!user) {
      logger.warn(`change password failed. User not found: ${user}`);
      return res.status(404).json({ message: 'User not found.' });
    }
    const isOldPasswordValid = await bcryptHelper.comparePassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      logger.warn(`change password failed. Old password is incorrect: ${isOldPasswordValid}`);
      return res.status(401).json({ message: 'Old password is incorrect.' });
    }
    const hashedNewPassword = await bcryptHelper.hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();
    logger.info(`Password change successfully for: ${user}`);
    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error });
  }
};

const logout = async (req, res) => {
  try {
    logger.info('User logout');
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });
    return res.status(200).json({ message: 'Successfully logged out' });
  } catch (error) {
    return handleError(res, error, 'Logout error');
  }
};


module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgetPassword,
  getResetPassword,
  resetPassword,
  changePassword
}
