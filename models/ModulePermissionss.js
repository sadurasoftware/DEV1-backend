const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ModulePermissions = sequelize.define('ModulePermissions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,  
  },
  moduleId: {
    type: DataTypes.INTEGER,
    allowNull: false,  
  },
  permissionId: {
    type: DataTypes.STRING,
    allowNull: false,  
  },
});

ModulePermissions.associate = models => {
 
  ModulePermissions.belongsTo(models.Module, {
    foreignKey: 'moduleId',
    as: 'module',
  });
 
  ModulePermissions.hasMany(models.Permission, {
    foreignKey: 'permissionId',
    as: 'permission',
  });
};

module.exports = ModulePermissions;
