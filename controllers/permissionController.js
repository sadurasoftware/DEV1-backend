const Permission=require('../models/Permission');
const logger = require('../config/logger');
const createPermission=async(req,res)=>{
    try{
        const {name}=req.body;
        const existingPermission = await Permission.findOne({ where: { name } });
        if (existingPermission) {
            logger.warn('Create permission failed. Permission already exists');
            return res.status(400).json({ message: 'Permission already exists' });
        }
        const permission=await Permission.create({name});
        logger.info('Permission created successfully');
        return res.status(201).json({message: 'Permission created successfully',permission});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'server error'});
    }
}
const getPermission=async(req,res)=>{
    try{
        const permission=await Permission.findAll();
        logger.info('Permission fetched successfully');
        return res.status(200).json({message:'success',permission});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'server error'});
    }
}
const getPermissionById=async(req,res)=>{
    try{
        const {id}=req.params;
        const permission=await Permission.findByPk(id);
        if(!permission){
            logger.warn('Get permission by id failed. Permission not found');
            return res.status(404).json({message:'Permission not found'});
        }
        logger.info('Permission fetched successfully');
        return res.status(200).json({message:'success',permission});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'server error'});
    }
}

const updatePermission=async(req,res)=>{
    try{
        const {id}=req.params;
        const {name}=req.body;
        console.log(req.body);
        const permission=await Permission.findByPk(id);
        if(!permission){
            logger.warn('Permission not found');
            return res.status(404).json({message:'Permission not found'});
        }
        permission.name=name;
       
        await permission.save();
        logger.info('Permission updated successfully');
        return res.status(200).json({message:'Permission updated successfully',permission});
    }catch(error){
        console.log(error);
        logger.error('Error updating permission');
        return res.status(500).json({message:'server error'});
    }
}

module.exports={
    createPermission,getPermission,getPermissionById, updatePermission
}