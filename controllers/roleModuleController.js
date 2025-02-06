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



module.exports={
  createRoleModule,
  getRoleModule,
  
}