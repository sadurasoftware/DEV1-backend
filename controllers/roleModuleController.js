const {Role,Module,RoleModule}=require('../models');
const logger = require('../config/logger');

const createRoleModule=async(req,res)=>{
    try{
        const {roleId,moduleId}=req.body;
        if(roleId){
            const role=await Role.findByPk(roleId);
            if(!role){
                logger.warn('Create role module failed. Role not found');
                return res.status(404).json({message:'Role not found'});
            }
        }
        if(moduleId){
            const module=await Module.findByPk(moduleId);
            if(!module){
                logger.warn('Create role module failed. Module not found');
        }
    }
        const roleModule=await RoleModule.create({roleId,moduleId});
        if(!roleModule){
            logger.warn('Create role module failed. Role module already exists');
            return res.status(400).json({message:'Role module already exists'});
        }
        logger.info('Role module created successfully');
        return res.status(201).json({message:'Role module created successfully',roleModule});
    }
    catch(error){
        console.log(error);
        logger.error('Error creating role module');
        return res.status(500).json({message:'server error'});
    }
}


const getRoleModule=async(req,res)=>{
  try{
      const roleModule=await RoleModule.findAll();
      logger.info('Role module fetched successfully');
      return res.status(200).json({message:'Role module fetched successfully',roleModule});
  }catch(error){
      console.log(error);
      logger.error('Error fetching role module');
      return res.status(500).json({message:'server error'});
  }
}

const getRoleModuleById=async(req,res)=>{
    try{
        const {id}=req.params;
        const roleModule=await RoleModule.findByPk(id);
        if(!roleModule){
            logger.warn('Get role module by id failed. Role module not found');
            return res.status(404).json({message:'Role module not found'});
        }
        logger.info('Role module fetched successfully');
        return res.status(200).json({message:'Role module fetched successfully',roleModule});
    }catch(error){
        console.log(error);
        logger.error('Error fetching role module');
        return res.status(500).json({message:'server error'});
    }
}

const updateRoleModule = async (req, res) => {
    try {
      const { roleModuleId, roleId, moduleId } = req.body;
      if (!roleModuleId) {
        logger.warn('Update role module failed. RoleModule ID is required');
        return res.status(400).json({ message: 'RoleModule ID is required' });
      }
      const roleModule = await RoleModule.findByPk(roleModuleId);
      if (!roleModule) {
        logger.warn(`Update role module failed. RoleModule with ID ${roleModuleId} not found`);
        return res.status(404).json({ message: 'RoleModule not found' });
      }
      if (roleId) {
        const role = await Role.findByPk(roleId);
        if (!role) {
          logger.warn(`Update role module failed. Role with ID ${roleId} not found`);
          return res.status(404).json({ message: 'Role not found' });
        }
      }
      if (moduleId) {
        const module = await Module.findByPk(moduleId);
        if (!module) {
          logger.warn(`Update role module failed. Module with ID ${moduleId} not found`);
          return res.status(404).json({ message: 'Module not found' });
        }
      }
      if (roleId) roleModule.roleId = roleId;
      if (moduleId) roleModule.moduleId = moduleId;
  
      await roleModule.save();
  
      logger.info(`RoleModule with ID ${roleModuleId} updated successfully`);
      return res.status(200).json({
        message: 'RoleModule updated successfully',
        roleModule,
      });
    } catch (error) {
      console.error('Error updating RoleModule:', error);
      logger.error('Error updating RoleModule:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };


  const deleteRoleModule=async(req,res)=>{
    try{
        const {id}=req.params;
        const roleModule=await RoleModule.findByPk(id);
        if(!roleModule){
            logger.warn('Delete role module failed. Role module not found');
            return res.status(404).json({message:'Role module not found'});
        }
        await roleModule.destroy();
        logger.info('Role module deleted successfully');
        return res.status(200).json({message:'Role module deleted successfully',roleModule});
    }catch(error){
        console.log(error);
        logger.error('Error deleting role module');
        return res.status(500).json({message:'server error'});
    }
}


const getRoleForModule = async (req, res) => {
    try {
      const { roleId } = req.params;
      if (!roleId) {
        logger.warn('Role ID is missing in request parameters');
        return res.status(400).json({ message: 'Role ID is required' });
      }
      const role = await Role.findByPk(roleId, {
        attributes: ['id', 'name'],
        include: {
          model: Module,
          through: { attributes: [] }, 
          as: 'modules', 
        },
      });

      if (!role) {
        logger.warn(`Role with ID ${roleId} not found`);
        return res.status(404).json({ message: 'Role not found' });
      }
      logger.info(`Fetched modules for Role ID: ${roleId}`);
      res.status(200).json({roleId: role.id,roleName: role.name,module: role.module,}); 
    } catch (err) {
      logger.error('Error fetching modules for role:', err);
      res.status(500).json({
        message: 'Error fetching modules for role',
        error: err.message,
      });
    }
  };


module.exports={
  createRoleModule,
  getRoleModule,
  getRoleModuleById,
  updateRoleModule,
  deleteRoleModule,
  getRoleForModule
}