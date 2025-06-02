const { Designation, Department } = require('../models');
const { Op, fn, col } = require('sequelize');

const createDesignation = async (req, res) => {
  try {
    const { name, departmentId } = req.body;
    const trimmedName = name.trim();

    const existing = await Designation.findOne({
      where: {
        departmentId,
        name: fn('LOWER', trimmedName),
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'Designation already exists in this department' });
    }

    const designation = await Designation.create({ name: trimmedName, departmentId });
    return res.status(201).json({ message: 'Designation created', designation });
  } catch (err) {
    console.error('Create Designation Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createDesignation,
};
