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
        return res.status(403).json({ message: `Access denied: Requires role ${requiredRoles}.` });
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
      const [role, module, permission] = await Promise.all([
        Role.findByPk(roleId),
        Module.findOne({ where: { name: moduleName } }),
        Permission.findOne({ where: { name: permissionName } }),
      ]);

      if (!role) return res.status(404).json({ message: "Role not found." });
      if (!module) return res.status(404).json({ message: "Module not found." });
      if (!permission) return res.status(404).json({ message: "Permission not found." });

      const rolePermission = await RoleModulePermission.findOne({
        where: {
          roleId: role.id,
          moduleId: module.id,
          permissionId: permission.id,
          status: true,
        },
      });

      if (!rolePermission) {
        return res.status(403).json({
          message: "Access denied.",
          details: `Your role '${role.name}'does not have the '${permission.name}' permission for the '${module.name}' module.`,
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
