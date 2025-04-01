const Category  = require('../models/Category');
const createCategory = async (req, res) => {
  try {
    const { name} = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await Category.create({ name });
    return res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    category.name = name || category.name;
    await category.save();
    return res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };