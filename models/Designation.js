
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Designation = sequelize.define('Designation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});


module.exports = Designation;
