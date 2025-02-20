const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoleModulePermission = sequelize.define('RoleModulePermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  moduleId: {
    type: DataTypes.INTEGER,  
    allowNull: false,
  },
  permissionId: {
    type: DataTypes.INTEGER,  
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, 
  },
});


RoleModulePermission.associate = (models) => {
  RoleModulePermission.belongsTo(models.Role, { foreignKey: 'roleId', as: 'Role' });
  RoleModulePermission.belongsTo(models.Module, { foreignKey: 'moduleId', as: 'Module' });
  RoleModulePermission.belongsTo(models.Permission, { foreignKey: 'permissionId', as: 'Permission' });
};

module.exports = RoleModulePermission;
