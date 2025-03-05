// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
//const { authenticateToken } = require('../middlewares/authMiddleware');
//const { checkPermission } = require('../middlewares/checkRole');
const categoryController = require('../controllers/categoryController');

router.post('/create', categoryController.createCategory);
router.get('/get', categoryController.getCategories);
router.put('/update/:id',  categoryController.updateCategory);
router.delete('/delete/:id', categoryController.deleteCategory);

module.exports = router;