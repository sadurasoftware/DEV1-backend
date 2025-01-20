const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
dotenv.config();

const isAuthenticated = (req, res, next) => {

    console.log(req.cookies); // Log cookies to see if token is sent
  
    const token = req.cookies.token;
  
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; 
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
  };
  

module.exports = { isAuthenticated };
