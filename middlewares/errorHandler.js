exports.errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({ message: err.message || 'Internal Server Error' });
  };
  