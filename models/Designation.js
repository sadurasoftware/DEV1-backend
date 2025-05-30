
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
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

Designation.associate = (models) => {
  Designation.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
};

module.exports = Designation;
