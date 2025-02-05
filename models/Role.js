const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

Role.associate = models => {
 
  Role.hasMany(models.User, {
    foreignKey: 'roleId',
    as: 'users',
  });
  
};

module.exports = Role;
