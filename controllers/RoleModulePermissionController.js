const { RoleModulePermission, Role, Module, Permission } = require('../models');
const logger = require('../config/logger');
const createRoleModulePermission = async (req, res) => {
  try {
    const { roleId, moduleId, permissionId } = req.body;
    if (!roleId || !Array.isArray(moduleId) || !Array.isArray(permissionId)) {
      logger.warn('Create role module permission failed. Invalid data.');
      return res.status(400).json({
        message: 'roleId, moduleId (array), and permissionId (array) are required.',
      });
    }
    if (moduleId.length !== permissionId.length) {
      logger.warn('Create role module permission failed. Invalid data.');
      return res.status(400).json({
        message: 'moduleId and permissionId arrays must have the same length.',
      });
    }
    const role = await Role.findByPk(roleId);
    if (!role) return res.status(404).json({ message: 'Role not found.' });
    const modules = await Module.findAll({ where: { id: moduleId } });
    if (modules.length !== moduleId.length)
      return res.status(404).json({ message: 'Some modules not found.' });
    const permissions = await Permission.findAll({ where: { id: permissionId } });
    if (permissions.length !== permissionId.length)
      return res.status(404).json({ message: 'Some permissions not found.' });
    const roleModulePermissions = [];
    for (let i = 0; i < moduleId.length; i++) {
      const existingPermission = await RoleModulePermission.findOne({
        where: { roleId, moduleId: moduleId[i], permissionId: permissionId[i] },
      });

      if (!existingPermission) {
        roleModulePermissions.push({
          roleId,
          moduleId: moduleId[i],
          permissionId: permissionId[i],
        });
      }
    }

    if (roleModulePermissions.length === 0) {
      logger.warn('Create role module permission failed. All permissions already exist.');
      return res.status(409).json({
        message: 'All permissions already exist for the provided role, modules, and permissions.',
      });
    }

    await RoleModulePermission.bulkCreate(roleModulePermissions);
    logger.info('Role module permissions created successfully.');
    return res.status(201).json({ message: 'Permissions created successfully.' });
  } catch (error) {
    console.error('Error creating RoleModulePermission:', error);
    return res.status(500).json({ message: 'An error occurred.' });
  }
};

const getModulesForRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    if (!roleId) {
      logger.warn('No role ID provided.');
      return res.status(400).json({ message: 'roleId is required.' });
    }
    const role = await Role.findByPk(roleId);
    if (!role) {
      logger.warn('Role not found.');
      return res.status(404).json({ message: 'Role not found.' });
    }
    const roleModulePermissions = await RoleModulePermission.findAll({
      where: { roleId },
      include: [
        {
          model: Module,
          as: 'Module',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (roleModulePermissions.length === 0) {
      logger.warn('No modules found for this role.');
      return res.status(404).json({ message: 'No modules found for this role.' });
    }

    const uniqueModules = [];
    const moduleMap = new Map();

    for (const item of roleModulePermissions) {
      const module = item.Module;
      if (!moduleMap.has(module.id)) {
        moduleMap.set(module.id, module);
        uniqueModules.push(module.name); 
      }
    }
    const response = {
      roleId: role.id,
      roleName: role.name,
      modules: uniqueModules,
    };
    logger.info('Modules fetched successfully for this role.');
    return res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching modules for this role.');
    console.error('Error fetching modules for role:', error);
    return res.status(500).json({ message: 'An error occurred while fetching modules.' });
  }
};

const getModulesAndPermissionsByRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    if (!roleId) {
      logger.warn('No role ID provided.');
      return res.status(400).json({ message: 'roleId is required.' });
    }
    const role = await Role.findByPk(roleId);
    if (!role) {
      logger.warn('Role not found.');
      return res.status(404).json({ message: 'Role not found.' });
    }
    const roleModulePermissions = await RoleModulePermission.findAll({
      where: { roleId },
      include: [
        {
          model: Module,
          as: 'Module',
          attributes: ['id', 'name'], 
        },
        {
          model: Permission,
          as: 'Permission',
          attributes: ['id', 'name'], 
        },
      ],
    });

    if (roleModulePermissions.length === 0) {
      logger.warn('No modules or permissions found for this role.');
      return res.status(404).json({ message: 'No modules or permissions found for this role.' });
    }
    const response = {
      roleId: role.id,
      roleName: role.name,
      roleModules: []
    };

    roleModulePermissions.forEach(item => {
      const module = item.Module; 
      const permission = item.Permission; 
      const existingModule = response.roleModules.find(m => m.moduleId === module.id);

      if (existingModule) {
        existingModule.Permissions.push(permission.name);
      } else {
        response.roleModules.push({
          moduleId: module.id,
          moduleName: module.name,
          Permissions: [permission.name], 
        });
      }
    });
    logger.info('Modules and permissions fetched successfully for this role.');
    return res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching modules and permissions for this role.');
    console.error('Error occurred while fetching modules and permissions for roleId:', error);
    return res.status(500).json({ message: 'An error occurred while fetching modules and permissions.' });
  }
};

const addPermissionsToRole = async (req, res) => {
  try {
    const { roleId, moduleId, permissionId } = req.body;

    if (!roleId || !moduleId || !permissionId || !Array.isArray(moduleId) || !Array.isArray(permissionId)) {
      return res.status(400).json({ message: 'roleId, moduleId, and permissionId are required. moduleId and permissionId should be arrays.' });
    }
    const role = await Role.findByPk(roleId);
    if (!role) {
      logger.warn('Role not found.');
      return res.status(404).json({ message: 'Role not found.' });
    }
    const createdPermissions = [];
    for (const modId of moduleId) {
      const module = await Module.findByPk(modId);
      if (!module) {
        logger.warn(`Module with ID ${modId} not found.`);
        return res.status(404).json({ message: `Module with ID ${modId} not found.` });
      }

      for (const permId of permissionId) {
        const permission = await Permission.findByPk(permId);
        if (!permission) {
          return res.status(404).json({ message: `Permission with ID ${permId} not found.` });
        }
        const existingPermission = await RoleModulePermission.findOne({
          where: {
            roleId,
            moduleId: modId,
            permissionId: permId,
          },
        });

        if (existingPermission) {
          logger.warn(`Permission with ID ${permId} already exists for this role and module.`);
          return res.status(409).json({ message: `Permission with ID ${permId} already exists for this role and module.` });
        }
        const newPermission = await RoleModulePermission.create({
          roleId,
          moduleId: modId,
          permissionId: permId,
        });

        createdPermissions.push(newPermission);
      }
    }
    logger.info('Permissions added successfully.');
    return res.status(201).json({ message: 'Permissions added successfully.', createdPermissions });
  } catch (error) {
    console.error('Error occurred while adding permissions:', error);
    return res.status(500).json({ message: 'An error occurred while adding permissions.' });
  }
};

const removePermissionsFromRole = async (req, res) => {
  try {
    const { roleId, moduleId, permissionId } = req.body;
    if (!roleId || !moduleId || !permissionId || !Array.isArray(moduleId) || !Array.isArray(permissionId)) {
      return res.status(400).json({ message: 'roleId, moduleId, and permissionId are required. moduleId and permissionId should be arrays.' });
    }
    const role = await Role.findByPk(roleId);
    if (!role) {
      logger.warn('Role not found.');
      return res.status(404).json({ message: 'Role not found.' });
    }
    const removedPermissions = [];
    for (const modId of moduleId) {
      const module = await Module.findByPk(modId);
      if (!module) {
        logger.warn(`Module with ID ${modId} not found.`);
        return res.status(404).json({ message: `Module with ID ${modId} not found.` });
      }
      for (const permId of permissionId) {
        const permission = await Permission.findByPk(permId);
        if (!permission) {
          logger.warn(`Permission with ID ${permId} not found.`);
          return res.status(404).json({ message: `Permission with ID ${permId} not found.` });
        }
        const permissionToRemove = await RoleModulePermission.findOne({
          where: {
            roleId,
            moduleId: modId,
            permissionId: permId,
          },
        });

        if (!permissionToRemove) {
          logger.warn(`Permission with ID ${permId} does not exist for this role and module.`);
          return res.status(404).json({ message: `Permission with ID ${permId} does not exist for this role and module.` });
        }
        logger.info(`Permission with ID ${permId} removed successfully.`);
        await permissionToRemove.destroy();
        removedPermissions.push({ moduleId: modId, permissionId: permId });
      }
    }
    logger.info('Permissions removed successfully.');
    return res.status(200).json({ message: 'Permissions removed successfully.', removedPermissions });
  } catch (error) {
    console.error('Error occurred while removing permissions:', error);
    return res.status(500).json({ message: 'An error occurred while removing permissions.' });
  }
};
const deleteModule = async (req, res) => {
  try {
    const { moduleId, moduleName } = req.body; 
    if (!moduleId && !moduleName) {
      logger.warn('Either moduleId or moduleName is required.');
      return res.status(400).json({ message: 'Either moduleId or moduleName is required.' });
    }
    let module;
    if (moduleId) {
      module = await Module.findByPk(moduleId); 
    } else if (moduleName) {
      module = await Module.findOne({ where: { name: moduleName } }); 
    }
    if (!module) {
      return res.status(404).json({ message: 'Module not found.' });
    }
    logger.info(`Deleting module: ${module.name}`);
    await RoleModulePermission.destroy({ where: { moduleId: module.id } });
    logger.info(`Deleted related permissions for module: ${module.name}`);
    await module.destroy();
    return res.status(200).json({ message: 'Module and its related permissions deleted successfully.' });
  } catch (error) {
    console.error('Error occurred while deleting module:', error);
    return res.status(500).json({ message: 'An error occurred while deleting the module.' });
  }
};
const deletePermission = async (req, res) => {
  try {
    const { permissionId, permissionName } = req.body; // Accept permissionId or permissionName
    if (!permissionId && !permissionName) {
      return res.status(400).json({ message: 'Either permissionId or permissionName is required.' });
    }
    let permission;
    if (permissionId) {
      permission = await Permission.findByPk(permissionId);
    } else if (permissionName) {
      permission = await Permission.findOne({ where: { name: permissionName } });
    }

    if (!permission) {
      return res.status(404).json({ message: 'Permission not found.' });
    }
    await RoleModulePermission.destroy({ where: { permissionId: permission.id } });
    await permission.destroy();

    return res.status(200).json({ message: 'Permission and its related role-module permissions deleted successfully.' });

  } catch (error) {
    console.error('Error occurred while deleting permission:', error);
    return res.status(500).json({ message: 'An error occurred while deleting the permission.' });
  }
};

module.exports = {
  createRoleModulePermission,
  getModulesForRole,
  getModulesAndPermissionsByRole,
  addPermissionsToRole,
  removePermissionsFromRole,
  deleteModule,
  deletePermission
};
