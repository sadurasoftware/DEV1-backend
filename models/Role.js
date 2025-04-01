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
    
  },
});

Role.associate = models => {
  Role.hasMany(models.User, {
    foreignKey: 'roleId',
    as: 'users',
  });
};

Role.associate = models => {
  Role.hasMany(models.RoleModulePermission, {
    foreignKey: 'roleId',
    as: 'RoleModulePermissions',
  });
};

module.exports = Role;
