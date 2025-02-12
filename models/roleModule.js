const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoleModule = sequelize.define('RoleModule', {
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
    type: DataTypes.STRING,
    allowNull: false,  
  },
});
RoleModule.associate = models => {
 
  RoleModule.belongsTo(models.Role, {
    foreignKey: 'roleId',
    as: 'role',
  });

  RoleModule.hasMany(models.Module, {
    foreignKey: 'moduleId',
    as: 'module',
  });
};

module.exports = RoleModule;
