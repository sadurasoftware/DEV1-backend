const { Country, State, Location, Branch } = require('../models');
const { Op, fn, col } = require('sequelize');
const createCountry = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Country.findOne({ where: { name: name.trim() } });
    if (existing) return res.status(400).json({ message: 'Country already exists' });

    const country = await Country.create({ name: name.trim() });
    res.status(201).json(country);
  } catch (error) {
    res.status(500).json({ message: 'Error creating country', error: error.message });
  }
};

const getCountries = async (req, res) => {
  try {
    const countries = await Country.findAll({include:'states'});
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching countries', error: error.message });
  }
}

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
    const country = await Country.findByPk(id);
    if (!country) return res.status(404).json({ message: 'Country not found' });
    const existing = await Country.findOne({ where: { name: name.trim() } });
    if (existing && existing.id !== country.id) {
      return res.status(400).json({ message: 'Country name already in use' });
    }
    await country.update({ name: name.trim() });
    res.status(200).json(country);
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
    } = req.body;

    const country = await Country.findByPk(countryId);
    if (!country) return res.status(404).json({ message: 'Country not found' });

    if (countryName) {
      const existingCountry = await Country.findOne({
        where: {
          id: { [Op.ne]: countryId },
          name: fn('LOWER', countryName.trim()),
        },
      });
      if (existingCountry) {
        return res.status(409).json({ message: 'Country name already exists' });
      }
      country.name = countryName.trim();
      await country.save();
    }

    const state = await State.findByPk(stateId);
    if (!state) return res.status(404).json({ message: 'State not found' });

    if (stateName) {
      const existingState = await State.findOne({
        where: {
          id: { [Op.ne]: stateId },
          name: fn('LOWER', stateName.trim()),
          countryId,
        },
      });
      if (existingState) {
        return res.status(409).json({ message: 'State name already exists in the same country' });
      }
      state.name = stateName.trim();
      await state.save();
    }

    const location = await Location.findByPk(locationId);
    if (!location) return res.status(404).json({ message: 'Location not found' });

    if (locationName) {
      const existingLocation = await Location.findOne({
        where: {
          id: { [Op.ne]: locationId },
          name: fn('LOWER', locationName.trim()),
          stateId,
        },
      });
      if (existingLocation) {
        return res.status(409).json({ message: 'Location name already exists in the same state' });
      }
      location.name = locationName.trim();
      await location.save();
    }

    const branch = await Branch.findByPk(branchId);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    if (branchName) {
      const existingBranch = await Branch.findOne({
        where: {
          id: { [Op.ne]: branchId },
          name: fn('LOWER', branchName.trim()),
          locationId,
        },
      });
      if (existingBranch) {
        return res.status(409).json({ message: 'Branch name already exists in the same location' });
      }
      branch.name = branchName.trim();
    }

    if (pincode) {
      branch.pincode = pincode;
    }

    await branch.save();

    return res.status(200).json({
      message: 'Master data updated successfully',
      updated: {
        countryId,
        stateId,
        locationId,
        branchId,
      },
    });

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