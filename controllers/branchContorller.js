const { Branch, Location,State,Country } = require('../models');
const { Op, fn } = require('sequelize');

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
        name: fn('LOWER', trimmedName),
        pincode,
        locationId,
        stateId,
        countryId,
      },
    });

    if (exists) {
      return res.status(409).json({
        message: 'Branch already exists with the same name and pincode in this /state/country/location',
      });
    }
    const branch = await Branch.create({
      name: trimmedName,
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
    const { locationId } = req.query;
    const condition = locationId ? { where: { locationId } } : {};

    const branches = await Branch.findAll({
      ...condition,
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
      order: [['name', 'ASC']],
    });

    return res.status(200).json({ branches });
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
        name: fn('LOWER', trimmedName),
        pincode,
        countryId,
        stateId,
        locationId,
      },
    });

    if (existing) {
      return res.status(409).json({
        message: 'Another branch with this name and pincode already exists in the same /state/countrylocation',
      });
    }
    branch.name = trimmedName;
    branch.pincode = pincode;
    branch.countryId = countryId;
    branch.stateId = stateId;
    branch.locationId = locationId;
    
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