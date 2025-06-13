const { Branch, Location,State,Country } = require('../models');
const { Op, fn ,col, where } = require('sequelize');

const createBranch = async (req, res) => {
  try {
    const { name, pincode, locationId, stateId, countryId } = req.body;

    if (!name || !pincode || !countryId || !stateId || !locationId  ) {
      return res.status(400).json({
        message: 'Branch name, pincode,  countryId, stateId,and locationId are required',
      });
    }
    const trimmedName = name.trim();
    const exists = await Branch.findOne({
      where: {
        pincode,
        countryId,
        stateId,
        locationId,
        [Op.and]: [
          where(fn('LOWER', col('Branch.name')), trimmedName.toLowerCase())
        ]
      }
    });
    if (exists) {
      return res.status(409).json({
        message: 'Branch already exists with the same name and pincode in this /state/country/location',
      });
    }
    const formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();

    const branch = await Branch.create({
      name: formattedName,
      pincode,
      countryId,
      stateId,
      locationId,
    });
    return res.status(201).json({
      message: 'Branch created successfully',
      branch,
    });
  } catch (error) {
    console.error('Create branch error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const getAllBranches = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const searchLower = search.toLowerCase();

    const branches = await Branch.findAndCountAll({
      include: [
        {
          model: Location,
          as: 'location',
          attributes: ['id', 'name'],
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name'],
              include: [
                {
                  model: Country,
                  as: 'country',
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        }
      ],
      where: {
        [Op.or]: [
          where(fn('LOWER', col('Branch.name')), {
            [Op.like]: `%${searchLower}%`
          }),
          where(fn('LOWER', col('location.name')), {
            [Op.like]: `%${searchLower}%`
          }),
          where(fn('LOWER', col('location.state.name')), {
            [Op.like]: `%${searchLower}%`
          }),
          where(fn('LOWER', col('location.state.country.name')), {
            [Op.like]: `%${searchLower}%`
          }),
        ]
      },
      order: [['name', 'ASC']],
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    return res.status(200).json({
      total: branches.count,
      page: parseInt(page),
      totalPages: Math.ceil(branches.count / limit),
      branches: branches.rows
    });
  } catch (error) {
    console.error('Get branches error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    return res.status(200).json({ branch });
  } catch (error) {
    console.error('Get branch error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pincode, countryId, stateId, locationId } = req.body;

    if (!name || !pincode|| !countryId || !stateId || !locationId ) {
      return res.status(400).json({
        message: 'Branch name, pincode, countryId, stateId, and locationId are required',
      });
    }
    const trimmedName = name.trim();
    const branch = await Branch.findByPk(id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    const existing = await Branch.findOne({
      where: {
        id: { [Op.ne]: id },
        pincode,
        locationId,
        stateId,
        countryId,
        [Op.and]: [
          where(fn('LOWER', col('Branch.name')), trimmedName.toLowerCase())
        ]
      }
    });
    if (existing) {
      return res.status(409).json({
        message: 'Another branch with this name and pincode already exists in the same /state/countrylocation',
      });
    }
    const formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();

    branch.name = formattedName;
    branch.pincode = pincode;
    branch.locationId = locationId;
    branch.stateId = stateId;
    branch.countryId = countryId;

    await branch.save();
    return res.status(200).json({ message: 'Branch updated successfully', branch });
  } catch (error) {
    console.error('Update branch error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};;
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    await branch.destroy();

    return res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Delete branch error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports ={
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch
}