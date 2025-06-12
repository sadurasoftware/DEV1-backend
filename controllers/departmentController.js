const Department = require('../models/Department');
const { Op, fn, col, where } = require('sequelize');

const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Department name is required." });
    }
    const existingDepartment = await Department.findOne({
      where: where(fn('LOWER', col('name')), name.trim().toLowerCase())
    });
    
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department already exists' });
    }
    const department = await Department.create({ name });
    return res.status(201).json({ message: "Department created successfully", department });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while creating department" });
  }
};
const getAllDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = search.trim().toLowerCase();

    const whereCondition = searchTerm
      ? {
          [Op.and]: [
            where(fn('LOWER', col('Department.name')), {
              [Op.like]: `%${searchTerm}%`
            })
          ]
        }
      : {};
    const { rows: departments, count: total } = await Department.findAndCountAll({
      where: whereCondition,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      message: "Departments fetched successfully",
      data: departments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch departments error:', error);
    return res.status(500).json({
      message: "An error occurred while fetching departments",
      error: error.message
    });
  }
};
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    return res.status(200).json({ message: 'Department fetched successfully', department });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching department' });
  }
};
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Department name is required.' });
    }
    const trimmedName = name.trim();
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    const existing = await Department.findOne({
      where: {
        id: { [Op.ne]: id },
        [Op.and]: [
          where(fn('LOWER', col('name')), trimmedName.toLowerCase())
        ]
      }
    });
    if (existing) {
      return res.status(409).json({ message: 'Another department with the same name already exists' });
    }
    department.name = trimmedName;
    await department.save();
    return res.status(200).json({
      message: 'Department updated successfully',
      department
    });

  } catch (error) {
    console.error('Update department error:', error);
    return res.status(500).json({
      message: 'An error occurred while updating department',
      error: error.message
    });
  }
};
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    await department.destroy();
    return res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while deleting department' });
  }
};

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
