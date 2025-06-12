const { User, Department } = require('../models');
const { Role } = require('../models');
const {RoleModulePermission,Module,Permission}=require('../models');
const bcryptHelper = require('../utils/bcryptHelper');
const jwtHelper = require('../utils/jwtHelper');
const emailHelper = require('../utils/emailHelper');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { where } = require('sequelize');
dotenv.config();

const handleError = (res, error, message) => {
  return res.status(500).json({ message: 'Server error', error });
};

const register = async (req, res) => {
  try {
    const { firstname, lastname, email, password,department,terms} = req.body;
    // if (password !== confirmPassword) {
    //   return res.status(400).json({ message: 'Passwords do not match' });
    // }
    
    if (!terms) {
      return res.status(400).json({ message: 'You must accept the terms and conditions to register' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const roleData = await Role.findOne({ where: { name: 'superadmin' } });
    if (!roleData) {
     res.status(400).json({ message: 'role not found' });
    }
    const departmentName = department || 'General department';
    const departmentData = await Department.findOne({ where: { name: departmentName } });
    if (!departmentData) {
      return res.status(400).json({ message: `Invalid department: ${departmentName}` });
    }
    const hashedPassword = await bcryptHelper.hashPassword(password);
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      isVerified: false,
      roleId: roleData.id,
      departmentId: departmentData.id,
      terms,
      isActive: true,
      last_LoggedIn: null
    });
    const tokenPayload = { id: newUser.id, email: newUser.email, firstname: newUser.firstname, lastname: newUser.lastname };
    const token = jwtHelper.generateToken(tokenPayload, process.env.JWT_SECRET, '10m');
    const verificationUrl = `${process.env.VERIFICATION_URL}/verify-email/${token}`;
    await emailHelper.verificationEmail(email, verificationUrl, firstname);
    return res.status(200).json({
      message: 'User created successfully. Please verify your email.',
      user: { id: newUser.id, firstname: newUser.firstname, email: newUser.email, token },
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({message:'server error'});
  }
};
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }
    const token = jwtHelper.generateToken({ email }, process.env.JWT_SECRET, '2m');
    const verificationUrl = `${process.env.VERIFICATION_URL}/verify-email/${token}`;
    await emailHelper.verificationEmail(email, verificationUrl, user.firstname);
    return res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    return handleError(res, error, 'Resend verification email error');
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email not verified. Please verify your email.' });
    } 
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is inactive. Please contact admin.' });
    }
    const isPasswordValid = await bcryptHelper.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    await user.update({ last_LoggedIn: new Date() });
    const tokenPayload = { id: user.id, email: user.email ,roleId: user.roleId};
    const token = jwtHelper.generateToken(tokenPayload, process.env.JWT_SECRET, '1h');
    res.cookie('authToken', token, {
      httpOnly: true,      
      secure: true,
      sameSite: 'Strict',  
      maxAge: 1000 * 60 * 60, 
    });
    const permissions = await RoleModulePermission.findAll({
      where: { roleId: user.roleId, status: true },
      include: [
        { model: Module, as: "Module", attributes: ["name"] }, 
        { model: Permission, as: "Permission", attributes: ["name"] }, 
      ],
    });

    const permissionList = permissions.map((perm) => ({
      module: perm.Module.name,
      permission: perm.Permission.name,
      status: perm.status 
    }));
      //   const roleData = await Role.findOne({ where: { id: user.roleId } });
      //   if (!roleData) {
      //   return res.status(400).json({ message: 'Invalid role' });
      // }
      const userData = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        roleId: user.roleId,
        department: user.department ? user.department.name : null,
        isVerified: user.isVerified,
        isActive: user.isActive,
        last_LoggedIn: user.last_LoggedIn,
        terms: user.terms,
      };
      return res.status(200).json({
        token,
        user: userData,
        permissions: permissionList
      });
  } catch (error) {
    console.log(error)
    return res.status(500).json({message:'server error'});
  }
};
const verifyEmail = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ error: 'Token is missing' });
  }
  const loginUrl = process.env.FRONTEND_LOGIN_URL
  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid token or user not found' });
    }

    if (user.isVerified) {
      return res.set("Content-Type", "text/html").send(
        Buffer.from(
          `<div style="text-align:center; font-family: Arial, sans-serif; padding: 20px;">
            <div style="display: inline-block; background-color: #e6f7e6; padding: 20px; border-radius: 10px; border: 2px solid #4CAF50; text-align: center; max-width: 400px;">
              <h2 style="color: #4CAF50; font-size: 24px; font-weight: bold;">
                Your email is already verified.
              </h2>
              <div style="font-size: 40px; color: #4CAF50; margin-bottom: 20px;">&#10004;</div>
              <a href="${loginUrl}" 
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
    return res.set("Content-Type", "text/html").send(
      Buffer.from(
        `<div style="text-align:center; font-family: Arial, sans-serif; padding: 20px;">
          <div style="display: inline-block; background-color: #e6f7e6; padding: 20px; border-radius: 10px; border: 2px solid #4CAF50; text-align: center; max-width: 400px;">
            <h2 style="color: #4CAF50; font-size: 24px; font-weight: bold;">
              Your email is successfully verified. You can log in now.
            </h2>
            <div style="font-size: 40px; color: #4CAF50; margin-bottom: 20px;">&#10004;</div>
            <a href="${loginUrl}" 
               style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 18px;">
               Login
            </a>
          </div>
        </div>`
      )
    );
    
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
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
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const token = jwtHelper.generateToken({ email }, process.env.JWT_SECRET, '1h');
    const url = `${process.env.FORGET_PASSWORD_URL}?token=${token}`;
    await emailHelper.forgotPasswordEmail(user.email, url, user.firstname);
    return res.status(200).json({ message: 'Password reset link sent successfully' });
  } catch (error) {
    return handleError(res, error, 'Forget password error');
  }
};

const getResetPassword = async (req, res) => {
  const { token } = req.query; 
  if (!token) {
    return res.status(400).json({ message: 'Token is required to reset password.' });
  }
  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.redirect(`${process.env.RESET_PASSWORD_URL}?token=${token}`);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const hashedPassword = await bcryptHelper.hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    return handleError(res, error, 'Reset password error');
  }
};
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old password and new password are required.' });
  }
  try {
    const userId = req.user.id; 
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const isOldPasswordValid = await bcryptHelper.comparePassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ message: 'Old password is incorrect.' });
    }
    const hashedNewPassword = await bcryptHelper.hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();
    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};
const logout = async (req, res) => {
  try {
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
const setPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    const { email } = jwtHelper.verifyToken(token, process.env.JWT_SECRET);
    const user = await CreateUser.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Invalid token or user not found' });
    }
    const hashedPassword = await bcryptHelper.hashPassword(password);
    user.password = hashedPassword;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({ message: 'Password set successfully. You can now log in.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Token expired or server error' });
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
  changePassword,
  setPassword
}
