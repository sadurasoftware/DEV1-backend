const Role=require('../models/Role');
const logger=require('../config/logger');
const createRole=async(req,res)=>{
    try{
        const { name } = req.body;
        console.log(req.body);
        const existingRole=await Role.findOne({where:{name}});
        if(existingRole){
            logger.warn('Create role failed. Role already exists');
            return res.status(400).json({message:'Role already exists'});
        }
        const role=await Role.create({name});
        logger.info('Role created successfully');
        return res.status(201).json({message:'Role created successfully',role});
    }catch(error){
        console.log(error);
        logger.error('Error creating role');
        return res.status(500).json({message:'server error'});
    }
}
const getAllRoles=async(req,res)=>{
    try{
        const roles=await Role.findAll();
        logger.info('Roles fetched successfully');
        return res.status(200).json({message:'Roles fetched successfully',roles});
    }catch(error){
        console.log(error);
        logger.error('Error fetching roles');
        return res.status(500).json({message:'server error'});
    }
}
const getRollById=async(req,res)=>{
    try{
        const {id}=req.params;
        const role=await Role.findByPk(id);
        if(!role){
            logger.warn('Role not found');
            return res.status(404).json({message:'Role not found'});
        }
        logger.info('Role fetched successfully');
        return res.status(200).json({message:'Role fetched successfully',role});
    }catch(error){
        console.log(error);
        logger.error('Error fetching role');
        return res.status(500).json({message:'server error'});
    }
}

const updateRole=async(req,res)=>{
    try{
        const {id}=req.params;
        const {name}=req.body;
        console.log(req.body);
        const role=await Role.findByPk(id);
        if(!role){
            logger.warn('Role not found');
            return res.status(404).json({message:'Role not found'});
        }
        role.name=name;
       
        await role.save();
        logger.info('Role updated successfully');
        return res.status(200).json({message:'Role updated successfully',role});
    }catch(error){
        console.log(error);
        logger.error('Error updating role');
        return res.status(500).json({message:'server error'});
    }
}

module.exports={
    createRole,getAllRoles,getRollById,updateRole
}