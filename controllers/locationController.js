const { Location, State,Branch ,Country} = require('../models');
const { Op, fn,col,where } = require('sequelize');

const createLocation = async (req, res) => {
  try {
    const { name, countryId, stateId } = req.body;
    if (!name || !countryId || !stateId) {
      return res.status(400).json({ message: 'Location name, countryId and stateId are required' });
    }
    const trimmedName = name.trim();
    const existing = await Location.findOne({
      where: {
        countryId,
        stateId,
        [Op.and]: [
          where(fn('LOWER', col('Location.name')), {
            [Op.like]: trimmedName.toLowerCase()
          })
        ]
      }
    });

    if (existing) {
      return res.status(409).json({ message: 'Location already exists in this country and state' });
    }
    const formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();
    const location = await Location.create({
      name: formattedName,
      countryId,
      stateId,
    });
    return res.status(201).json({ message: 'Location created successfully', location });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const getAllLocations = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search
      ? {
          [Op.or]: [
            where(fn('LOWER', col('Location.name')), {
              [Op.like]: `%${search.toLowerCase()}%`,
            }),
            where(fn('LOWER', col('state.name')), {
              [Op.like]: `%${search.toLowerCase()}%`,
            }),
            where(fn('LOWER', col('state.country.name')), {
              [Op.like]: `%${search.toLowerCase()}%`,
            }),
          ],
        }
      : {};

    const { count, rows: locations } = await Location.findAndCountAll({
      where: whereClause,
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
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    return res.status(200).json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      locations,
    });
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
        countryId,
        stateId,
        [Op.and]: [
          where(fn('LOWER', col('Location.name')), {
            [Op.like]: trimmedName.toLowerCase()
          }),
          {
            id: { [Op.ne]: id }
          }
        ]
      }
    });

    if (existing) {
      return res.status(409).json({ message: 'Another location with this name already exists in the same country and state' });
    }
    const formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();

    location.name = formattedName;
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