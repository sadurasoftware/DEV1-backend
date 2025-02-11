const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Module = sequelize.define('Module', {
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

// Module.associate = (models) => {
//   Module.belongsToMany(models.Role, {
//     through: models.RoleModuless,
//     foreignKey: 'moduleId',
//     as: 'roles',
//   });

//   Module.belongsToMany(models.Permission, {
//     through: models.ModulePermissionss,
//     foreignKey: 'moduleId',
//     as: 'permissions',
//   });

//   Module.hasMany(models.RoleModuless, {
//     foreignKey: 'moduleId',
//     as: 'roleModules',
//   });

//   Module.hasMany(models.ModulePermissionss, {
//     foreignKey: 'moduleId',
//     as: 'modulePermissions',
//   });
// };

module.exports = Module;
