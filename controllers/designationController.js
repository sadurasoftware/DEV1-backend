const { Designation, Department } = require('../models');
const { Op, fn, col } = require('sequelize');

const createDesignation = async (req, res) => {
  try {
    const { name} = req.body;
    const trimmedName = name.trim();

    const existing = await Designation.findOne({
      where: {
        name: fn('LOWER', trimmedName),
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'Designation already exists' });
    }
    const designation = await Designation.create({ name: trimmedName});
    return res.status(201).json({ message: 'Designation created', designation });
  } catch (err) {
    console.error('Create Designation Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllDesignations = async (req, res) => {
  try {
    const designations = await Designation.findAll();
    return res.status(200).json({ message: 'Designations fetched Successfully', designations });
  } catch (err) {
    console.error('Get Designation Error:', err);
    return res.status(500).json({ message: 'An error occurred while fetching designation'});
  }
}
const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name} = req.body;
    const trimmedName = name.trim();

    const designation = await Designation.findByPk(id);
    if (!designation) return res.status(404).json({ message: 'Designation not found' });

    const exists = await Designation.findOne({
      where: {
        id: { [Op.ne]: id },
        name: fn('LOWER', trimmedName),
      },
    });
    if (exists) {
      return res.status(409).json({ message: 'Another designation with this name already exists' });
    }
    designation.name = trimmedName;
    await designation.save();

    return res.status(200).json({ message: 'Designation updated', designation });
  } catch (err) {
    console.error('Update Designation Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
const getDesignationById =async (req, res) => {
  try {
    const { id } = req.params;
    const designation = await Designation.findByPk(id);
    if (!designation) return res.status(404).json({ message: 'DesignationId not found' });
    return res.status(200).json({ message: 'Designation fetched successfully', designation });
  } catch (err) {
    console.error('Get Designation Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
const deleteDesignation =async(req,res)=>{
  try {
    const { id } = req.params;
    const designation = await Designation.findByPk(id);
    if (!designation) return res.status(404).json({ message: 'DesignationId not found' });
    await designation.destroy();
    return res.status(200).json({ message: 'Designation deleted successfully' });
  } catch (err) {
    console.error('Delete Designation Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
module.exports = {
  createDesignation,
  getAllDesignations,
  updateDesignation,
  getDesignationById,
  deleteDesignation
};
