
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const { checkRole} = require('../middlewares/checkRole');
const categoryController = require('../controllers/categoryController');
const validator=require('../validator/router-validator');

router.post('/create', authenticateToken,checkRole('superadmin'),validator.createCategorySchemaValidator,categoryController.createCategory);
router.get('/get',authenticateToken, categoryController.getCategories);
router.put('/update/:id',authenticateToken,checkRole('superadmin'),validator.updateCategorySchemaValidator, categoryController.updateCategory);
router.delete('/delete/:id',authenticateToken,checkRole('superadmin'),validator.deleteCategorySchemaValidator,categoryController.deleteCategory);

module.exports = router;