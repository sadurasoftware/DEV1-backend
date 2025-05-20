const { Location, State,Branch } = require('../models');
const { Op, fn } = require('sequelize');

const createLocation = async (req, res) => {
  try {
    const { name, stateId } = req.body;
    if (!name || !stateId) {
      return res.status(400).json({ message: 'Location name and stateId are required' });
    }
    const trimmedName = name.trim();
    const existing = await Location.findOne({
      where: {
        name: fn('LOWER', trimmedName),
        stateId,
      },
    });
    if (existing) {
      return res.status(409).json({ message: 'Location already exists in this state' });
    }
    const location = await Location.create({ name: trimmedName, stateId });
    return res.status(201).json({ message: 'Location created successfully', location });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllLocations = async (req, res) => {
  try {
    const { stateId } = req.query;
    const condition = stateId ? { where: { stateId } } : {};
    const locations = await Location.findAll({
      ...condition,
      include: [{ model: State, as: 'state', attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
    });
    return res.status(200).json({ locations });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getLocationsById =async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findByPk(id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    return res.status(200).json({ location });
  } catch (error) {
    console.error('Get location by id error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, stateId } = req.body;
    if (!name || !stateId) {
      return res.status(400).json({ message: 'Location name and stateId are required' });
    }
    const trimmedName = name.trim();
    const location = await Location.findByPk(id);

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    const existing = await Location.findOne({
      where: {
        id: { [Op.ne]: id },
        name: fn('LOWER', trimmedName),
        stateId,
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'Another location with this name already exists in the same state' });
    }

    location.name = trimmedName;
    location.stateId = stateId;
    await location.save();

    return res.status(200).json({ message: 'Location updated successfully', location });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteLocation = async (req, res) => {
    try {
      const { id } = req.params;
  
      const location = await Location.findByPk(id, {
        include: {
          model: Branch,
          as: 'branches',
        },
      });
  
      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }
  
      await location.destroy();
  
      return res.status(200).json({ message: 'Location and its branches deleted successfully' });
    } catch (error) {
      console.error('Delete Location Error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
const getLocationsByState = async (req, res) => {
    try {
      const { stateId } = req.query;
      if (!stateId) {
        return res.status(400).json({ message: 'stateId is required' });
      }
  
      const locations = await Location.findAll({
        where: { stateId },
        order: [['name', 'ASC']],
      });
  
      return res.status(200).json({ locations });
    } catch (error) {
      console.error('Get locations by state error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  

module.exports={
    createLocation,
    getAllLocations,
    getLocationsById,
    updateLocation,
    deleteLocation,
    getLocationsByState
}