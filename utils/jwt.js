const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const privateKey = process.env.JWT_PRIVATE_KEY; 
const expire = process.env.JWT_EXPIRY;

const generateToken = (payload, expiresIn = expire) => {
    return jwt.sign(payload, privateKey, { expiresIn });
};
const verifyToken = (token) => {
    return jwt.verify(token, privateKey);
};

module.exports = { generateToken, verifyToken };