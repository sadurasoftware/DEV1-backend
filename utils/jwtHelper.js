const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.generateToken = (payload, secret, expiresIn = '1h') => {
  return jwt.sign(payload, secret, { expiresIn });
};
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

exports.verifyAccessJWT = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
exports.generateResetToken = (userId, email) => {
  if (!userId || !email) {
    throw new Error('User ID and email are required to generate a token');
  }

  return jwt.sign(
    { userId, email }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' } 
  );
};

