const Role = require('../models/Role');
const{ Module,Permission,RoleModulePermission} = require('../models');
const checkRole = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      const { user } = req; 
      if (!user || !user.roleId) {
        return res.status(403).json({ message: 'Unauthorized: No role information found.' });
      }
      const role = await Role.findByPk(user.roleId);
      if (!role || !requiredRoles.includes(role.name)) {
        return res.status(403).json({ message: `Access denied: Requires role ${requiredRole}.` });
      }
      next();
    } catch (error) {
      console.error('Error in checkRole middleware:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  };
};

const checkPermission = (moduleName, permissionName) => {
  return async (req, res, next) => {
    try {
      const { roleId } = req.user; 
      const module = await Module.findOne({ where: { name: moduleName } });
      if (!module) return res.status(404).json({ message: "Module not found." });

      const permission = await Permission.findOne({ where: { name: permissionName } });
      if (!permission) return res.status(404).json({ message: "Permission not found." });

      const rolePermission = await RoleModulePermission.findOne({
        where: { roleId, moduleId: module.id, permissionId: permission.id, status: true },
      });

      if (!rolePermission) {
        return res.status(403).json({
          message: "Access denied.",
          details: `Your role (ID: ${roleId}) does not have the '${permissionName}' permission for the '${moduleName}' module.`,
        });
      }
      
      next();
    } catch (error) {
      console.error("Permission check failed:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };
};

module.exports ={ checkRole,checkPermission};
