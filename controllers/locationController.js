const { Location, State,Branch ,Country} = require('../models');
const { Op, fn } = require('sequelize');

const createLocation = async (req, res) => {
  try {
    const { name,countryId,stateId } = req.body;
    if (!name || !countryId || !stateId) {
      return res.status(400).json({ message: 'Location name, countryId and stateId are required' });
    }
    const trimmedName = name.trim();
    const existing = await Location.findOne({
      where: {
        name: fn('LOWER', trimmedName),
        countryId,
        stateId,
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'Location already exists in this country and state' });
    }

    const location = await Location.create({ name: trimmedName, countryId, stateId });

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
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name'],
          include: [
            {
              model: Country,
              as: 'country',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
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
    const { name, countryId, stateId } = req.body;
    if (!name || !stateId || !countryId) {
      return res.status(400).json({ message: 'Name, country and state are required' });
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
        countryId,
        stateId,
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'Another location with this name already exists in the same country and state' });
    }
    location.name = trimmedName;
    location.countryId = countryId;
    location.stateId = stateId;
    await location.save();

    return res.status(200).json({ message: 'Location updated successfully', location });
  } catch (error) {
    console.error('Update location error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
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
  const getLocationsByCountryAndState = async (req, res) => {
    try {
      const { countryId, stateId } = req.query;
  
      if (!countryId || !stateId) {
        return res.status(400).json({ message: 'countryId and stateId are required' });
      }
  
      const locations = await Location.findAll({
        where: {
          countryId,
          stateId,
        },
        include: [
          { model: State, as: 'state', attributes: ['id', 'name'] },
          { model: Country, as: 'country', attributes: ['id', 'name'] }
        ],
        order: [['name', 'ASC']],
      });
  
      return res.status(200).json({ locations });
    } catch (error) {
      console.error('Get locations error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  

module.exports={
    createLocation,
    getAllLocations,
    getLocationsById,
    updateLocation,
    deleteLocation,
    getLocationsByState,
    getLocationsByCountryAndState
}