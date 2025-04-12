const Module=require('../models/Module');
const createModule=async(req,res)=>{
    try{
        const {name}=req.body;
        const existingModule = await Module.findOne({ where: { name } });
        if (existingModule) {
        return res.status(400).json({ message: 'Module already exists' });
        }
        const module=await Module.create({name});
        return res.status(201).json({message: 'Module created successfully',module});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'server error'});
    }
}
const getModule=async(req,res)=>{
    try{
        const module=await Module.findAll();
        return res.status(200).json({message:'success',module});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'server error'});
    }
}

const getModuleById=async(req,res)=>{
    try{
        const {id}=req.params;
        const module=await Module.findByPk(id);
        if(!module){
            return res.status(404).json({message:'Module not found'});
        }
        return res.status(200).json({message:'success',module});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'server error'});
    }
}
const updateModule=async(req,res)=>{
    try{
        const {id}=req.params;
        const {name}=req.body;
        const module=await Module.findByPk(id);
        if(!module){
         return res.status(404).json({message:'Module not found'});
        }
        module.name=name;
        await module.save();
        return res.status(200).json({message:'Module updated successfully',module});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'server error'});
    }
}

module.exports={
    createModule,
    getModule,
    getModuleById,
    updateModule
}