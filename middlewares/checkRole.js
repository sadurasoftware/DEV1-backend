const Role = require('../models/Role');

const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const { user } = req; 

      if (!user || !user.roleId) {
        return res.status(403).json({ message: 'Unauthorized: No role information found.' });
      }

      const role = await Role.findByPk(user.roleId);
      if (!role || role.name !== requiredRole) {
        return res.status(403).json({ message: `Access denied: Requires role ${requiredRole}.` });
      }

      next();
    } catch (error) {
      console.error('Error in checkRole middleware:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  };
};

module.exports ={ checkRole};
