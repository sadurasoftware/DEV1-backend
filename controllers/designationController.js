const { Designation, Department } = require('../models');
const { Op, fn, col ,where} = require('sequelize');

const createDesignation = async (req, res) => {
  try {
    const { name} = req.body;
    const trimmedName = name.trim();

    const existing = await Designation.findOne({
      where: where(fn('LOWER', col('name')), trimmedName.toLowerCase())
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
    const { page = 1, limit = 10, search = '' } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = search.trim().toLowerCase();

    const whereCondition = searchTerm
      ? where(fn('LOWER', col('name')), { [Op.like]: `%${searchTerm}%` })
      : {};

    const { rows: designations, count: total } = await Designation.findAndCountAll({
      where: whereCondition,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      message: 'Designations fetched successfully',
      data: designations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('Get Designation Error:', err);
    return res.status(500).json({ message: 'An error occurred while fetching designations', error: err.message });
  }
};
const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name} = req.body;
    const trimmedName = name.trim();

    const designation = await Designation.findByPk(id);
    if (!designation) return res.status(404).json({ message: 'Designation not found' });

    const existing = await Designation.findOne({
      where: {
        id: { [Op.ne]: id },
        [Op.and]: where(fn('LOWER', col('name')), trimmedName.toLowerCase()),
      },
    });

    if (existing) {
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
