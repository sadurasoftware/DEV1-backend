const jwt = require('jsonwebtoken');
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // const token = req.body.token;
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next(); 
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token has expired.' });
    } else {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
  }
};

module.exports = {authenticateToken}
