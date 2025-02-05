const Module=require('../models/Module');
const logger = require('../config/logger');


const createModule=async(req,res)=>{
    try{
        const {name}=req.body;
        const existingModule = await Module.findOne({ where: { name } });
        if (existingModule) {
            logger.warn('Create module failed. Module already exists');
            return res.status(400).json({ message: 'Module already exists' });
        }
        const module=await Module.create({name});
        logger.info('Module created successfully');
        return res.status(201).json({message: 'Module created successfully',module});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'server error'});
    }
}


const getModule=async(req,res)=>{
    try{
        const module=await Module.findAll();
        logger.info('Module fetched successfully');
        return res.status(200).json({message:'success',module});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'server error'});
    }
}

const deleteModule=async(req,res)=>{
    try{
        const {id}=req.params;
        const module=await Module.findByPk(id);
        if(!module){
            logger.warn('Delete module failed. Module not found');
            return res.status(404).json({message:'Module not found'});
        }
        await module.destroy();
        logger.info('Module deleted successfully');
        return res.status(200).json({message:'Module deleted successfully',module});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'server error'});
    }
}


module.exports={
    createModule,
    getModule,
    deleteModule
}