const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const authenticateToken = (req, res, next) => {
  const token = req.body.token;
  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    logger.info('Token verified successfully. User authenticated.');
    next(); 
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.error('Token verification failed: Token has expired');
      return res.status(403).json({ message: 'Token has expired.' });
    } else {
      logger.error(`Token verification failed: ${error.message}`);
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
  }
};

module.exports = authenticateToken;
