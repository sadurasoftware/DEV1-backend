const express=require('express');
const userController=require('../controllers/userController');

const router=express.Router();

router.get('/', userController.getUsers)
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.get('/admin/:id', userController.getAdmin);

module.exports=router;