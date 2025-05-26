const Department = require('../models/Department');
const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Department name is required." });
    }
    const existingDepartment = await Department.findOne({ where: { name } });
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
    const departments = await Department.findAll();
    return res.status(200).json({ message: "Departments fetched successfully", departments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while fetching departments" });
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
    if (!name) {
      return res.status(400).json({ message: 'Department name is required.' });
    }
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    department.name = name;
    await department.save();
    return res.status(200).json({ message: 'Department updated successfully', department });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while updating department' });
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
