const { generateToken } = require('../utils/jwt');
const { verifyPassword } = require('../utils/hash');
const User = require('../models/registerUser'); 

const login = async (req, res) => {

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Password is incorrect.' });
    }

    const token = generateToken({ email });
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, 
    });

    res.status(200).json({
      token,
      username: user.username,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// logout
const logout = async (req, res) => {
  try {
    
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    // const token = req.cookies.token;
    // if (token) {
    //   const user = await User.findOne({ where: { token } });

    //   if (user) {
    //     user.token = null;
    //     await user.save();
    //   }
    // }

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, logout };
