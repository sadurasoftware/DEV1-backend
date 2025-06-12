const { Country, State, Location, Branch } = require('../models');
const { Op, fn, col,where } = require('sequelize');
const createCountry = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Country name is required' });
    }
    const trimmedName = name.trim();
    const existing = await Country.findOne({
      where: where(
        fn('LOWER', col('Country.name')),
        {
          [Op.like]: trimmedName.toLowerCase()
        }
      )
    });

    if (existing) {
      return res.status(409).json({ message: 'Country already exists' });
    }
    const formattedName =
      trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();

    const country = await Country.create({ name: formattedName });
    return res.status(201).json({ message: 'Country created successfully', country });
  } catch (error) {
    console.error('Create country error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCountries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      //isActive
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = {};
    if (search) {
      whereClause[Op.and] = [
        where(fn('LOWER', col('Country.name')), {
          [Op.like]: `%${search.toLowerCase()}%`
        })
      ];
    }
   
    // if (isActive !== undefined) {
    //   whereClause.isActive = isActive === 'true';
    // }

    const { rows: countries, count: total } = await Country.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: State,
          as: 'states' 
        }
      ],
      offset,
      limit: parseInt(limit),
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      countries,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching countries',
      error: error.message
    });
  }
};
const getCountryById =async (req, res) => {
  try {
    const { id } = req.params;
    const country = await Country.findByPk(id);
    if (!country) return res.status(404).json({ message: 'Country not found' });
    res.status(200).json(country);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching country', error: error.message });
  }
}
const updateCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Country name is required' });
    }
    const trimmedName = name.trim();
    const country = await Country.findByPk(id);
    if (!country) return res.status(404).json({ message: 'Country not found' });
    const existing = await Country.findOne({
      where: {
        [Op.and]: [
          where(fn('LOWER', col('Country.name')), {
            [Op.like]: trimmedName.toLowerCase()
          }),
          {
            id: { [Op.ne]: id } 
          }
        ]
      }
    });
    if (existing) {
      return res.status(400).json({ message: 'Country name already in use' });
    }
    const formattedName =
      trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();

    await country.update({ name: formattedName });
    res.status(200).json({ message: 'Country updated successfully', country });
  } catch (error) {
    res.status(500).json({ message: 'Error updating country', error: error.message });
  }
};
const deleteCountry = async (req, res) => {
    try {
      const { id } = req.params;
      const country = await Country.findByPk(id, {
        include: {
          model: State,
          as: 'states',
          include: {
            model: Location,
            as: 'locations',
            include: {
              model: Branch,
              as: 'branches',
            },
          },
        },
      });
  
      if (!country) {
        return res.status(404).json({ message: 'Country not found' });
      }
  
      await country.destroy();
  
      res.status(200).json({ message: 'Country and all related data deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
const getAllCountriesWithHierarchy = async (req, res) => {
  try {
    const countries = await Country.findAll({
      include: [
        {
          model: State,
          as: 'states',
          include: [
            {
              model: Location,
              as: 'locations',
              include: [
                {
                  model: Branch,
                  as: 'branches',
                },
              ],
            },
          ],
        },
      ],
      order: [
        ['name', 'ASC'],
        ['states', 'name', 'ASC'],
        ['states', 'locations', 'name', 'ASC'],
        ['states', 'locations', 'branches', 'name', 'ASC'],
      ],
    });

    res.status(200).json(countries);
  } catch (error) {
    console.error('Error fetching full country hierarchy:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const getCountryWithStatesAndBranches = async (req, res) => {
  try {
    const { id } = req.params;

    const country = await Country.findByPk(id, {
      include: [
        {
          model: State,
          as: 'states',
          include: [
            {
              model: Location,
              as: 'locations',
              include: [
                {
                  model: Branch,
                  as: 'branches',
                },
              ],
            },
          ],
        },
      ],
      order: [
        ['name', 'ASC'],
        ['states', 'name', 'ASC'],
        ['states', 'locations', 'name', 'ASC'],
        ['states', 'locations', 'branches', 'name', 'ASC'],
      ],
    });

    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    res.status(200).json(country);
  } catch (error) {
    console.error('Error fetching country with hierarchy:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const updateAllMasterData = async (req, res) => {
  try {
    const {
      countryId,
      countryName,
      stateId,
      stateName,
      locationId,
      locationName,
      branchId,
      branchName,
      pincode,
      countryRefId,
      stateRefId,
      locationRefId,
    } = req.body;

    const result = {};

    if (countryId && countryName) {
      const country = await Country.findByPk(countryId);
      if (!country) return res.status(404).json({ message: 'Country not found' });

      const duplicate = await Country.findOne({
        where: { id: { [Op.ne]: countryId }, name: fn('LOWER', countryName.trim()) },
      });
      if (duplicate) return res.status(409).json({ message: 'Country name already exists' });

      country.name = countryName.trim();
      await country.save();
      result.country = country;
    }

    if (stateId && stateName && countryRefId) {
      const state = await State.findByPk(stateId);
      if (!state) return res.status(404).json({ message: 'State not found' });

      const duplicate = await State.findOne({
        where: {
          id: { [Op.ne]: stateId },
          name: fn('LOWER', stateName.trim()),
          countryId: countryRefId,
        },
      });
      if (duplicate) return res.status(409).json({ message: 'State name already exists in this country' });

      state.name = stateName.trim();
      state.countryId = countryRefId;
      await state.save();
      result.state = state;
    }

    if (locationId && locationName  && countryRefId && stateRefId) {
      const location = await Location.findByPk(locationId);
      if (!location) return res.status(404).json({ message: 'Location not found' });

      const duplicate = await Location.findOne({
        where: {
          id: { [Op.ne]: locationId },
          name: fn('LOWER', locationName.trim()),
          stateId: stateRefId,
        },
      });
      if (duplicate) return res.status(409).json({ message: 'Location already exists in this state' });

      location.name = locationName.trim();
      location.countryId = countryRefId;
      location.stateId = stateRefId;
      await location.save();
      result.location = location;
    }

    if (branchId && branchName && pincode && countryRefId && stateRefId && locationRefId ) {
      const branch = await Branch.findByPk(branchId);
      if (!branch) return res.status(404).json({ message: 'Branch not found' });

      const duplicate = await Branch.findOne({
        where: {
          id: { [Op.ne]: branchId },
          name: fn('LOWER', branchName.trim()),
          pincode,
          countryId: countryRefId,
          stateId: stateRefId,
          locationId: locationRefId,
        },
      });
      if (duplicate) return res.status(409).json({ message: 'Branch already exists in this location/state/country' });

      branch.name = branchName.trim();
      branch.pincode = pincode;
      branch.countryId = countryRefId;
      branch.stateId = stateRefId;
      branch.locationId = locationRefId;
      await branch.save();
      result.branch = branch;
    }
    if (Object.keys(result).length === 0) {
      return res.status(400).json({ message: 'No valid data provided for update' });
    }
    return res.status(200).json({ message: 'Update successful', data: result });
  } catch (error) {
    console.error('Update master data error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports={
    createCountry,
    getCountries,
    getCountryById,
    updateCountry,
    deleteCountry,
    getAllCountriesWithHierarchy,
    getCountryWithStatesAndBranches,
    updateAllMasterData
}