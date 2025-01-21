const rateLimit = require('express-rate-limit');

const rateLimitHelper = {
  configure: (options) => {
    return rateLimit({
      windowMs: options.windowMs || 15 * 60 * 1000, 
      max: options.max || 100, 
      message: options.message || 'Too many requests, please try again later.',
      headers: true,
    });
  },
};

module.exports = rateLimitHelper;
