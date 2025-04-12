const { RoleModulePermission, Role, Module, Permission } = require('../models');

const createRoleModulePermission = async (req, res) => {
  try {
    const { roleId, moduleId, permissionId, status } = req.body;

    if (!roleId || !moduleId || !permissionId || typeof status !== "boolean") {
      return res.status(400).json({ message: "Invalid input format." });
    }
    const [role, module, permission] = await Promise.all([
      Role.findByPk(roleId),
      Module.findByPk(moduleId),
      Permission.findByPk(permissionId),
    ]);

    if (!role || !module || !permission) {
      return res.status(404).json({ message: "Role, Module, or Permission not found." });
    }
    const existingPermission = await RoleModulePermission.findOne({
      where: { roleId, moduleId, permissionId },
    });

    if (status) {
      if (existingPermission) {
        await existingPermission.update({ status: true });
        return res.status(200).json({ message: "Permission status updated to true." });
      } else {
        await RoleModulePermission.create({ roleId, moduleId, permissionId, status: true });
        return res.status(201).json({ message: "Permission added successfully." });
      }
    } else {
      if (existingPermission) {
        await existingPermission.update({ status: false });
        return res.status(200).json({ message: "Permission status updated to false." });
      } else {
        return res.status(404).json({ message: "Permission not found to update." });
      }
    }
  } catch (error) {
    console.error("Error toggling RoleModulePermission:", error);
    return res.status(500).json({ message: "An error occurred.", error: error.message });
  }
};

const getModulesForRole = async (req, res) => {
  try {
    const { roleId } = req.query;
    if (!roleId) {
      return res.status(400).json({ message: 'roleId is required.' });
    }
    const role = await Role.findByPk(roleId);
    if (!role) {
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
      return res.status(404).json({ message: 'No modules found for this role.' });
    }
    const uniqueModules = [];
    const moduleMap = new Map();
    for (const item of roleModulePermissions) {
      const module = item.Module;
      if (!moduleMap.has(module.id)) {
        moduleMap.set(module.id, module);
        uniqueModules.push(module.id); 
      }
    }
    const response = {
      roleId: role.id,
      roleName: role.name,
      modules: uniqueModules,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching modules for role:', error);
    return res.status(500).json({ message: 'An error occurred while fetching modules.' });
  }
}; 
const getModulesAndPermissionsByRole = async (req, res) => {
  try {
    const { roleId } = req.query;
    if (!roleId) {
      return res.status(400).json({ message: 'roleId is required.' });
    }
    const role = await Role.findByPk(roleId);
    if (!role) {
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
    
    const response = {
      roleId: role.id,
      roleName: role.name,
      roleModules: []
    };
    if (roleModulePermissions.length === 0) {
      return res.status(200).json(response);
    }
    roleModulePermissions.forEach(item => {
      const module = item.Module; 
      const permission = item.Permission; 
      const existingModule = response.roleModules.find(m => m.moduleId === module.id);

       if (existingModule) {
        existingModule.permissions.push({
          permissionId: permission.id,
          permissionName: permission.name,
          status: item.status, 
        });
      } else {
        response.roleModules.push({
          moduleId: module.id,
          moduleName: module.name,
          permissions: [
            {
              permissionId: permission.id,
              permissionName: permission.name,
              status: item.status,
            },
          ],
        });
      }
    });
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error occurred while fetching modules and permissions for roleId:', error);
    return res.status(500).json({ message: 'An error occurred while fetching modules and permissions.' });
  }
};

const deleteModule = async (req, res) => {
  try {
    const { moduleId, moduleName } = req.params; 
    if (!moduleId && !moduleName) {
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
    await RoleModulePermission.destroy({ where: { moduleId: module.id } });
    await module.destroy();
    return res.status(200).json({ message: 'Module and its related permissions deleted successfully.' });
  } catch (error) {
    console.error('Error occurred while deleting module:', error);
    return res.status(500).json({ message: 'An error occurred while deleting the module.' });
  }
};
const deletePermission = async (req, res) => {
  try {
    const { permissionId, permissionName } = req.params;
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
const updatePermission = async (req, res) => {
  try {
    const { permissionId, permissionName, newPermissionName } = req.body;
    if ((!permissionId && !permissionName) || !newPermissionName) {
      return res.status(400).json({ message: 'Either permissionId or permissionName and newPermissionName are required.' });
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
    await RoleModulePermission.update(
      { permissionName: newPermissionName }, 
      { where: { permissionId: permission.id } }
    );
    permission.name = newPermissionName;
    await permission.save();
    return res.status(200).json({ message: 'Permission updated successfully.', updatedPermission: permission });

  } catch (error) {
    console.error('Error occurred while updating permission:', error);
    return res.status(500).json({ message: 'An error occurred while updating the permission.' });
  }
};
const updateModule = async (req, res) => {
  try {
    const { moduleId, moduleName, newModuleName } = req.body;
    if ((!moduleId && !moduleName) || !newModuleName) {
      return res.status(400).json({ message: 'Either moduleId or moduleName and newModuleName are required.' });
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
    await RoleModulePermission.update(
      { moduleName: newModuleName }, 
      { where: { moduleId: module.id } }
    );
    module.name = newModuleName;
    await module.save();
    return res.status(200).json({ message: 'Module updated successfully.', updatedModule: module });
  } catch (error) {
    console.error('Error occurred while updating module:', error);
    return res.status(500).json({ message: 'An error occurred while updating the module.' });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    if (!roleId) {
      return res.status(400).json({ message: 'Role ID is required.' });
    }
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found.' });
    }
    await RoleModulePermission.destroy({ where: { roleId } });
    await role.destroy();
    return res.status(200).json({ message: 'Role and its related permissions deleted successfully.' });
  } catch (error) {
    console.error('Error occurred while deleting role:', error);
    return res.status(500).json({ message: 'An error occurred while deleting the role.' });
  }
};


module.exports = {
  createRoleModulePermission,
  getModulesForRole,
  getModulesAndPermissionsByRole,
  deleteModule,
  deletePermission,
  updatePermission,
  updateModule,
  deleteRole
};








// const { RoleModulePermission, Role, Module, Permission } = require('../models');
// const { Op } = require('sequelize');
// const logger = require('../config/logger');

// const createRoleModulePermission = async (req, res) => {
//   const transaction = await RoleModulePermission.sequelize.transaction();
//   try {
//     const { roleId, modulePermissions } = req.body;
//     if (!roleId || !Array.isArray(modulePermissions)) {
//       logger.warn("Invalid input format.");
//       await transaction.rollback();
//       return res.status(400).json({ message: "Invalid input format." });
//     }

//     const role = await Role.findByPk(roleId, { transaction });
//     if (!role) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "Role not found." });
//     }
//     const moduleIds = modulePermissions.map(mp => mp.moduleId);
//     const permissionIds = modulePermissions.flatMap(mp => 
//       mp.permissions.map(p => parseInt(p.permissionId, 10)) 
//     );
//     const [modules, permissions] = await Promise.all([
//       Module.findAll({ where: { id: { [Op.in]: moduleIds } }, transaction }),
//       Permission.findAll({ where: { id: { [Op.in]: permissionIds } }, transaction })
//     ]);

//     const missingModules = moduleIds.filter(id => !modules.some(m => m.id === id));
//     const missingPermissions = permissionIds.filter(id => !permissions.some(p => p.id === id));

//     if (missingModules.length > 0 || missingPermissions.length > 0) {
//       await transaction.rollback();
//       return res.status(404).json({
//         message: "Some modules or permissions not found.",
//         missingModules,
//         missingPermissions
//       });
//     }
//     const existingPermissions = await RoleModulePermission.findAll({
//       where: {
//         roleId,
//         moduleId: { [Op.in]: moduleIds },
//         permissionId: { [Op.in]: permissionIds }
//       },
//       transaction
//     });
//     const existingSet = new Set(existingPermissions.map(perm => `${perm.moduleId}-${perm.permissionId}`));
//     const newPermissions = modulePermissions.flatMap(({ moduleId, permissions }) =>
//       permissions
//         .map(({ permissionId }) => ({
//           roleId,
//           moduleId,
//           permissionId
//         }))
//         .filter(({ moduleId, permissionId }) => !existingSet.has(`${moduleId}-${permissionId}`))
//     );

//     if (newPermissions.length === 0) {
//       await transaction.rollback();
//       return res.status(409).json({ message: "All permissions already exist." });
//     }
//     logger.info("Permissions created successfully.");
//     await RoleModulePermission.bulkCreate(newPermissions, { transaction });
//     await transaction.commit();
//     return res.status(201).json({ message: "Permissions created successfully." ,newPermissions});

//   } catch (error) {
//     logger.error("Error creating RoleModulePermission:", error);
//     await transaction.rollback();
//     console.error("Error creating RoleModulePermission:", error);
//     return res.status(500).json({ message: "An error occurred.", error: error.message });
//   }
// };

// const getModulesForRole = async (req, res) => {
//   try {
//     const { roleId } = req.body;
//     if (!roleId) {
//       logger.warn('No role ID provided.');
//       return res.status(400).json({ message: 'roleId is required.' });
//     }
//     const role = await Role.findByPk(roleId);
//     if (!role) {
//       logger.warn('Role not found.');
//       return res.status(404).json({ message: 'Role not found.' });
//     }
//     const roleModulePermissions = await RoleModulePermission.findAll({
//       where: { roleId },
//       include: [
//         {
//           model: Module,
//           as: 'Module',
//           attributes: ['id', 'name'],
//         },
//       ],
//     });

//     if (roleModulePermissions.length === 0) {
//       logger.warn('No modules found for this role.');
//       return res.status(404).json({ message: 'No modules found for this role.' });
//     }

//     const uniqueModules = [];
//     const moduleMap = new Map();

//     for (const item of roleModulePermissions) {
//       const module = item.Module;
//       if (!moduleMap.has(module.id)) {
//         moduleMap.set(module.id, module);
//         uniqueModules.push(module.name); 
//       }
//     }
//     const response = {
//       roleId: role.id,
//       roleName: role.name,
//       modules: uniqueModules,
//     };
//     logger.info('Modules fetched successfully for this role.');
//     return res.status(200).json(response);
//   } catch (error) {
//     logger.error('Error fetching modules for this role.');
//     console.error('Error fetching modules for role:', error);
//     return res.status(500).json({ message: 'An error occurred while fetching modules.' });
//   }
// };

// const getModulesAndPermissionsByRole = async (req, res) => {
//   try {
//     const { roleId } = req.body;
//     if (!roleId) {
//       logger.warn('No role ID provided.');
//       return res.status(400).json({ message: 'roleId is required.' });
//     }
//     const role = await Role.findByPk(roleId);
//     if (!role) {
//       logger.warn('Role not found.');
//       return res.status(404).json({ message: 'Role not found.' });
//     }
//     const roleModulePermissions = await RoleModulePermission.findAll({
//       where: { roleId },
//       include: [
//         {
//           model: Module,
//           as: 'Module',
//           attributes: ['id', 'name'], 
//         },
//         {
//           model: Permission,
//           as: 'Permission',
//           attributes: ['id', 'name'], 
//         },
//       ],
//     });

//     if (roleModulePermissions.length === 0) {
//       logger.warn('No modules or permissions found for this role.');
//       return res.status(404).json({ message: 'No modules or permissions found for this role.' });
//     }
//     const response = {
//       roleId: role.id,
//       roleName: role.name,
//       roleModules: []
//     };

//     roleModulePermissions.forEach(item => {
//       const module = item.Module; 
//       const permission = item.Permission; 
//       const existingModule = response.roleModules.find(m => m.moduleId === module.id);

//       if (existingModule) {
//         existingModule.Permissions.push(permission.id);
//       } else {
//         response.roleModules.push({
//           moduleId: module.id,
//           moduleName: module.name,
//           Permissions: [permission.id], 
//         });
//       }
//     });
//     logger.info('Modules and permissions fetched successfully for this role.');
//     return res.status(200).json(response);
//   } catch (error) {
//     logger.error('Error fetching modules and permissions for this role.');
//     console.error('Error occurred while fetching modules and permissions for roleId:', error);
//     return res.status(500).json({ message: 'An error occurred while fetching modules and permissions.' });
//   }
// };

// const addPermissionsToRole = async (req, res) => {
//   const { roleId, modulePermissions } = req.body;
//   if (!roleId || !Array.isArray(modulePermissions)) {
//     return res.status(400).json({ message: "roleId and modulePermissions are required." });
//   }
//   const transaction = await RoleModulePermission.sequelize.transaction();

//   try {
//     const role = await Role.findByPk(roleId);
//     if (!role) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "Role not found." });
//     }
//     const permissionsToCreate = [];
//     for (const { moduleId, permissions } of modulePermissions) {
//       const module = await Module.findByPk(moduleId);
//       if (!module) {
//         await transaction.rollback();
//         return res.status(404).json({ message: `Module with ID ${moduleId} not found.` });
//       }
//       const permissionIds = permissions.map(p => p.permissionId);
//       const foundPermissions = await Permission.findAll({
//         where: { id: permissionIds }
//       });
//       const missingPermissions = permissionIds.filter(id => !foundPermissions.some(p => p.id === id));
//       if (missingPermissions.length > 0) {
//         logger.warn(`Some permissions not found: ${missingPermissions}`);
//         await transaction.rollback();
//         return res.status(404).json({ message: "Some permissions not found.", missingPermissions });
//       }
//       const existingPermissions = await RoleModulePermission.findAll({
//         where: {
//           roleId,
//           moduleId,
//           permissionId: permissionIds
//         },
//         transaction
//       });
//       const existingSet = new Set(existingPermissions.map(perm => `${perm.moduleId}-${perm.permissionId}`));
//       permissions.forEach(({ permissionId }) => {
//         if (!existingSet.has(`${moduleId}-${permissionId}`)) {
//           permissionsToCreate.push({ roleId, moduleId, permissionId });
//         }
//       });
//     }
//     if (permissionsToCreate.length === 0) {
//       await transaction.rollback();
//       logger.warn("All permissions already exist for the provided role and modules.");
//       return res.status(409).json({ message: "All permissions already exist for the provided role and modules." });
//     }
//     logger.info("Adding permissions to the role...");
//     await RoleModulePermission.bulkCreate(permissionsToCreate, { transaction });
//     await transaction.commit();
//     return res.status(201).json({ message: "Permissions added successfully." });
//   } catch (error) {
//     logger.error("Error adding permissions:", error);
//     await transaction.rollback();
//     console.error("Error adding permissions:", error);
//     return res.status(500).json({ message: "An error occurred." });
//   }
// };

// const removePermissionsFromRole = async (req, res) => {
//   const { roleId, modulePermissions } = req.body;

//   if (!roleId || !Array.isArray(modulePermissions)) {
//     return res.status(400).json({ message: "roleId and modulePermissions are required." });
//   }
//   const transaction = await RoleModulePermission.sequelize.transaction();
//   try {
//     const role = await Role.findByPk(roleId);
//     if (!role) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "Role not found." });
//     }
//     for (const { moduleId, permissions } of modulePermissions) {
//       const module = await Module.findByPk(moduleId);
//       if (!module) {
//         await transaction.rollback();
//         return res.status(404).json({ message: `Module with ID ${moduleId} not found.` });
//       }
//       const permissionIds = permissions.map(p => p.permissionId);
//       const existingPermissions = await RoleModulePermission.findAll({
//         where: { roleId, moduleId, permissionId: permissionIds },
//         transaction
//       });

//       if (existingPermissions.length === 0) {
//         await transaction.rollback();
//         return res.status(404).json({ message: "No permissions found to remove." });
//       }
//       await RoleModulePermission.destroy({
//         where: {
//           roleId,
//           moduleId,
//           permissionId: permissionIds
//         },
//         transaction
//       });
//     }
//     logger.info("Permissions removed successfully.")
//     await transaction.commit();
//     return res.status(200).json({ message: "Permissions removed successfully." });
//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error removing permissions:", error);
//     return res.status(500).json({ message: "An error occurred." });
//   }
// };

// const deleteModule = async (req, res) => {
//   try {
//     const { moduleId, moduleName } = req.body; 
//     if (!moduleId && !moduleName) {
//       logger.warn('Either moduleId or moduleName is required.');
//       return res.status(400).json({ message: 'Either moduleId or moduleName is required.' });
//     }
//     let module;
//     if (moduleId) {
//       module = await Module.findByPk(moduleId); 
//     } else if (moduleName) {
//       module = await Module.findOne({ where: { name: moduleName } }); 
//     }
//     if (!module) {
//       return res.status(404).json({ message: 'Module not found.' });
//     }
//     logger.info(`Deleting module: ${module.name}`);
//     await RoleModulePermission.destroy({ where: { moduleId: module.id } });
//     logger.info(`Deleted related permissions for module: ${module.name}`);
//     await module.destroy();
//     return res.status(200).json({ message: 'Module and its related permissions deleted successfully.' });
//   } catch (error) {
//     console.error('Error occurred while deleting module:', error);
//     return res.status(500).json({ message: 'An error occurred while deleting the module.' });
//   }
// };
// const deletePermission = async (req, res) => {
//   try {
//     const { permissionId, permissionName } = req.body;
//     if (!permissionId && !permissionName) {
//       logger.warn('Either permissionId or permissionName is required.');
//       return res.status(400).json({ message: 'Either permissionId or permissionName is required.' });
//     }
//     let permission;
//     if (permissionId) {
//       permission = await Permission.findByPk(permissionId);
//     } else if (permissionName) {
//       permission = await Permission.findOne({ where: { name: permissionName } });
//     }

//     if (!permission) {
//       return res.status(404).json({ message: 'Permission not found.' });
//     }
//     logger.info(`Deleting permission: ${permission.name}`)
//     await RoleModulePermission.destroy({ where: { permissionId: permission.id } });
//     logger.info(`Deleted related role-module permissions for permission: ${permission.name}`);
//     await permission.destroy();
//     logger.info(`Deleted permission: ${permission.name}`);
//     return res.status(200).json({ message: 'Permission and its related role-module permissions deleted successfully.' });
//   } catch (error) {
//     console.error('Error occurred while deleting permission:', error);
//     return res.status(500).json({ message: 'An error occurred while deleting the permission.' });
//   }
// };

// const updatePermission = async (req, res) => {
//   try {
//     const { permissionId, permissionName, newPermissionName } = req.body;

//     if ((!permissionId && !permissionName) || !newPermissionName) {
//       logger.warn('Either permissionId or permissionName and newPermissionName are required.');
//       return res.status(400).json({ message: 'Either permissionId or permissionName and newPermissionName are required.' });
//     }
//     let permission;
//     if (permissionId) {
//       permission = await Permission.findByPk(permissionId);
//     } else if (permissionName) {
//       permission = await Permission.findOne({ where: { name: permissionName } });
//     }

//     if (!permission) {
//       return res.status(404).json({ message: 'Permission not found.' });
//     }
//     logger.info(`Updating permission: ${permission.name}`)
//     await RoleModulePermission.update(
//       { permissionName: newPermissionName }, 
//       { where: { permissionId: permission.id } }
//     );
//     permission.name = newPermissionName;
//     await permission.save();
//     logger.info(`Updated permission: ${permission.name}`)
//     return res.status(200).json({ message: 'Permission updated successfully.', updatedPermission: permission });

//   } catch (error) {
//     console.error('Error occurred while updating permission:', error);
//     return res.status(500).json({ message: 'An error occurred while updating the permission.' });
//   }
// };
// const updateModule = async (req, res) => {
//   try {
//     const { moduleId, moduleName, newModuleName } = req.body;
//     if ((!moduleId && !moduleName) || !newModuleName) {
//       logger.warn('Either moduleId or moduleName and newModuleName are required.');
//       return res.status(400).json({ message: 'Either moduleId or moduleName and newModuleName are required.' });
//     }
//     let module;
//     if (moduleId) {
//       module = await Module.findByPk(moduleId);
//     } else if (moduleName) {
//       module = await Module.findOne({ where: { name: moduleName } });
//     }

//     if (!module) {
//       return res.status(404).json({ message: 'Module not found.' });
//     }
//     logger.info(`Updating module: ${module.name}`)
//     await RoleModulePermission.update(
//       { moduleName: newModuleName }, 
//       { where: { moduleId: module.id } }
//     );
//     module.name = newModuleName;
//     await module.save();
//     logger.info(`Updated module: ${module.name}`)
//     return res.status(200).json({ message: 'Module updated successfully.', updatedModule: module });
//   } catch (error) {
//     console.error('Error occurred while updating module:', error);
//     return res.status(500).json({ message: 'An error occurred while updating the module.' });
//   }
// };

// module.exports = {
//   createRoleModulePermission,
//   getModulesForRole,
//   getModulesAndPermissionsByRole,
//   addPermissionsToRole,
//   removePermissionsFromRole,
//   deleteModule,
//   deletePermission,
//   updatePermission,
//   updateModule
// };