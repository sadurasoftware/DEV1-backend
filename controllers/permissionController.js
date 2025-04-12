const Permission=require('../models/Permission');
const createPermission=async(req,res)=>{
    try{
        const {name}=req.body;
        const existingPermission = await Permission.findOne({ where: { name } });
        if (existingPermission) {
            return res.status(400).json({ message: 'Permission already exists' });
        }
        const permission=await Permission.create({name});
        return res.status(201).json({message: 'Permission created successfully',permission});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'server error'});
    }
}
const getPermission=async(req,res)=>{
    try{
        const permission=await Permission.findAll();
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
            return res.status(404).json({message:'Permission not found'});
        }
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
        const permission=await Permission.findByPk(id);
        if(!permission){
            return res.status(404).json({message:'Permission not found'});
        }
        permission.name=name;
        await permission.save();
        return res.status(200).json({message:'Permission updated successfully',permission});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'server error'});
    }
}

module.exports={
    createPermission,getPermission,getPermissionById,updatePermission
}