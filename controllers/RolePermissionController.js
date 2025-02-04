const {Role,Permission,RolePermission}=require('../models');
const logger = require('../config/logger');

const createRolePermission=async(req,res)=>{
    try{
        const {roleId,permissionId}=req.body;
        if(roleId){
            const role=await Role.findByPk(roleId);
            if(!role){
                logger.warn('Create role permission failed. Role not found');
                return res.status(404).json({message:'Role not found'});
            }
        }
        if(permissionId){
            const permission=await Permission.findByPk(permissionId);
            if(!permission){
                logger.warn('Create role permission failed. Permission not found');
        }
    }
        const rolePermission=await RolePermission.create({roleId,permissionId});
        if(!rolePermission){
            logger.warn('Create role permission failed. Role permission already exists');
            return res.status(400).json({message:'Role permission already exists'});
        }
        logger.info('Role permission created successfully');
        return res.status(201).json({message:'Role permission created successfully',rolePermission});
    }
    catch(error){
        console.log(error);
        logger.error('Error creating role permission');
        return res.status(500).json({message:'server error'});
    }
}

const getRolePermission=async(req,res)=>{
    try{
        const rolePermission=await RolePermission.findAll();
        logger.info('Role permission fetched successfully');
        return res.status(200).json({message:'Role permission fetched successfully',rolePermission});
    }catch(error){
        console.log(error);
        logger.error('Error fetching role permission');
        return res.status(500).json({message:'server error'});
    }
}

const getRolePermissionById=async(req,res)=>{
    try{
        const {id}=req.params;
        const rolePermission=await RolePermission.findByPk(id);
        if(!rolePermission){
            logger.warn('Get role permission by id failed. Role permission not found');
            return res.status(404).json({message:'Role permission not found'});
        }
        logger.info('Role permission fetched successfully');
        return res.status(200).json({message:'Role permission fetched successfully',rolePermission});
    }catch(error){
        console.log(error);
        logger.error('Error fetching role permission');
        return res.status(500).json({message:'server error'});
    }
}

const updateRolePermission = async (req, res) => {
    try {
      const { rolePermissionId, roleId, permissionId } = req.body;
      if (!rolePermissionId) {
        logger.warn('Update role permission failed. RolePermission ID is required');
        return res.status(400).json({ message: 'RolePermission ID is required' });
      }
      const rolePermission = await RolePermission.findByPk(rolePermissionId);
      if (!rolePermission) {
        logger.warn(`Update role permission failed. RolePermission with ID ${rolePermissionId} not found`);
        return res.status(404).json({ message: 'RolePermission not found' });
      }
      if (roleId) {
        const role = await Role.findByPk(roleId);
        if (!role) {
          logger.warn(`Update role permission failed. Role with ID ${roleId} not found`);
          return res.status(404).json({ message: 'Role not found' });
        }
      }
      if (permissionId) {
        const permission = await Permission.findByPk(permissionId);
        if (!permission) {
          logger.warn(`Update role permission failed. Permission with ID ${permissionId} not found`);
          return res.status(404).json({ message: 'Permission not found' });
        }
      }
      if (roleId) rolePermission.roleId = roleId;
      if (permissionId) rolePermission.permissionId = permissionId;
  
      await rolePermission.save();
  
      logger.info(`RolePermission with ID ${rolePermissionId} updated successfully`);
      return res.status(200).json({
        message: 'RolePermission updated successfully',
        rolePermission,
      });
    } catch (error) {
      console.error('Error updating RolePermission:', error);
      logger.error('Error updating RolePermission:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

const deleteRolePermission=async(req,res)=>{
    try{
        const {id}=req.params;
        const rolePermission=await RolePermission.findByPk(id);
        if(!rolePermission){
            logger.warn('Delete role permission failed. Role permission not found');
            return res.status(404).json({message:'Role permission not found'});
        }
        await rolePermission.destroy();
        logger.info('Role permission deleted successfully');
        return res.status(200).json({message:'Role permission deleted successfully',rolePermission});
    }catch(error){
        console.log(error);
        logger.error('Error deleting role permission');
        return res.status(500).json({message:'server error'});
    }
}

const getRoleForPermissions = async (req, res) => {
    try {
      const { roleId } = req.params;
      if (!roleId) {
        logger.warn('Role ID is missing in request parameters');
        return res.status(400).json({ message: 'Role ID is required' });
      }
      const role = await Role.findByPk(roleId, {
        attributes: ['id', 'name'],
        include: {
          model: Permission,
          through: { attributes: [] }, 
          as: 'permissions', 
        },
      });

      if (!role) {
        logger.warn(`Role with ID ${roleId} not found`);
        return res.status(404).json({ message: 'Role not found' });
      }
      logger.info(`Fetched permissions for Role ID: ${roleId}`);
      res.status(200).json({roleId: role.id,roleName: role.name,permissions: role.permissions,}); 
    } catch (err) {
      logger.error('Error fetching permissions for role:', err);
      res.status(500).json({
        message: 'Error fetching permissions for role',
        error: err.message,
      });
    }
  };

module.exports={
    createRolePermission,
    getRolePermission,
    updateRolePermission,
    deleteRolePermission,
    getRolePermissionById,
    getRoleForPermissions,
}