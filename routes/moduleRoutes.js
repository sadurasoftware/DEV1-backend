const express=require('express');
const router=express.Router();
const ModuleController=require('../controllers/moduleController');

router.post('/create', ModuleController.createModule);
router.get('/get', ModuleController.getModule);
router.delete('/delete/:id',ModuleController.deleteModule);


module.exports=router;