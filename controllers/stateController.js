const { State, Country, Branch,Location} = require('../models');
const { Op, fn, col } = require('sequelize');

const createState = async (req, res) => {
  try {
    const { name, countryId } = req.body;
    if (!name || !countryId) {
      return res.status(400).json({ message: 'State name and countryId are required' });
    }
    const trimmedName = name.trim();
    const existing = await State.findOne({
      where: {
        name: fn('LOWER', trimmedName),
        countryId,
      },
    });
    if (existing) {
      return res.status(409).json({ message: 'State already exists in this country' });
    }
    const state = await State.create({ name: trimmedName, countryId });
    return res.status(201).json({ message: 'State created successfully', state });
  } catch (error) {
    console.error('Create state error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const getAllStates = async (req, res) => {
  try {
    const { countryId } = req.query;
    const condition = countryId ? { where: { countryId } } : {};
    const states = await State.findAll({
      ...condition,
      include: [{ model: Country, as: 'country', attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
    });
    return res.status(200).json({ states });
  } catch (error) {
    console.error('Get states error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getStateById =async (req, res) => {
  try {
    const { id } = req.params;
    const state = await State.findByPk(id);
    if (!state) {
      return res.status(404).json({ message: 'State not found' });
    }
    return res.status(200).json({ state });
  } catch (error) {
    console.error('Get state error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
const updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, countryId } = req.body;
    if (!name || !countryId) {
      return res.status(400).json({ message: 'State name and countryId are required' });
    }
    const trimmedName = name.trim();
    const state = await State.findByPk(id);
    if (!state) {
      return res.status(404).json({ message: 'State not found' });
    }
    const existing = await State.findOne({
      where: {
        id: { [Op.ne]: id },
        name: fn('LOWER', trimmedName),
        countryId,
      },
    });
    if (existing) {
      return res.status(409).json({ message: 'Another state with the same name exists in this country' });
    }
    state.name = trimmedName;
    state.countryId = countryId;
    await state.save();

    return res.status(200).json({ message: 'State updated successfully', state });
  } catch (error) {
    console.error('Update state error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const deleteState = async (req, res) => {
    try {
      const { id } = req.params;
  
      const state = await State.findByPk(id, {
        include: {
          model: Location,
          as: 'locations',
          include: {
            model: Branch,
            as: 'branches',
          },
        },
      });
  
      if (!state) {
        return res.status(404).json({ message: 'State not found' });
      }
  
      await state.destroy(); 
  
      res.status(200).json({ message: 'State and its related data deleted successfully' });
    } catch (error) {
      console.error('Delete State Error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
const getStatesByCountry = async (req, res) => {
    try {
      const { countryId } = req.query;
      if (!countryId) {
        return res.status(400).json({ message: 'countryId is required' });
      }
  
      const states = await State.findAll({
        where: { countryId },
        order: [['name', 'ASC']],
      });
  
      return res.status(200).json({ states });
    } catch (error) {
      console.error('Get states by country error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  

module.exports={
    createState,
    getAllStates,
    getStateById,
    updateState,
    deleteState,
    getStatesByCountry
}
