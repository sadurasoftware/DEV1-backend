const express=require('express');
const router=express.Router();
const roleController=require('../controllers/roleController');
const validator=require('../validator/router-validator');

router.post('/create',validator.roleValidator,roleController.createRole);
router.get('/get',roleController.getAllRoles);
router.get('/get/:id',roleController.getRollById);
router.put('/update/:id',roleController.updateRole);
router.delete('/delete/:id',roleController.deleteRole);

module.exports=router;