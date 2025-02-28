const Department = require('../models/Department');
const logger = require('../config/logger');

const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      logger.warn('Create department failed. Department name is required.');
      return res.status(400).json({ message: "Department name is required." });
    }
    const department = await Department.create({ name });
    logger.info(`Department created successfully: ${name}`);
    return res.status(201).json({ message: "Department created successfully", department });
  } catch (error) {
    logger.error('Error creating department');
    console.error(error);
    return res.status(500).json({ message: "An error occurred while creating department" });
  }
};

const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    logger.info('Departments fetched successfully');
    return res.status(200).json({ message: "Departments fetched successfully", departments });
  } catch (error) {
    logger.error('Error fetching departments');
    console.error(error);
    return res.status(500).json({ message: "An error occurred while fetching departments" });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    if (!department) {
      logger.warn(`Get department by id failed. Department not found: ID ${id}`);
      return res.status(404).json({ message: 'Department not found' });
    }
    logger.info(`Department fetched successfully: ID ${id}`);
    return res.status(200).json({ message: 'Department fetched successfully', department });
  } catch (error) {
    logger.error(`Error fetching department by ID ${req.params.id}`);
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching department' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      logger.warn(`Update department failed. Name is required.`);
      return res.status(400).json({ message: 'Department name is required.' });
    }

    const department = await Department.findByPk(id);
    if (!department) {
      logger.warn(`Update department failed. Department not found: ID ${id}`);
      return res.status(404).json({ message: 'Department not found' });
    }

    department.name = name;
    await department.save();

    logger.info(`Department updated successfully: ID ${id}`);
    return res.status(200).json({ message: 'Department updated successfully', department });
  } catch (error) {
    logger.error(`Error updating department by ID ${req.params.id}`);
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while updating department' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);
    if (!department) {
      logger.warn(`Delete department failed. Department not found: ID ${id}`);
      return res.status(404).json({ message: 'Department not found' });
    }

    await department.destroy();

    logger.info(`Department deleted successfully: ID ${id}`);
    return res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting department by ID ${req.params.id}`);
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
