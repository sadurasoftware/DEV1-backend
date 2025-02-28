const express=require('express');
const userController=require('../controllers/userController');

const router=express.Router();

router.post('/create',userController.createUser)
router.get('/users', userController.getUsers)
router.get('/admins', userController.getAdmins)
router.get('/', userController.getUsers)
router.get('/:id', userController.getUser);
router.get('/:id', userController.fetchUserData);
router.put('/:id', userController.updateUser);
router.get('/:id', userController.getAdmin);
router.get('/:id', userController.fetchAdminData);
router.put('/:id', userController.updateAdmin);
router.delete('/:id',userController.deleteuser)
module.exports=router;