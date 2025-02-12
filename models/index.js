const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const Module = require('./Module');
const Permission = require('./Permission');
const ModulePermissionss = require('./ModulePermissionss');
const RoleModuless = require('./roleModule');

const models = { User, Role, Module, Permission, ModulePermissionss, RoleModuless };

User.associate(models);
Role.associate(models);
// Module.associate(models);
// Permission.associate(models);
ModulePermissionss.associate(models);
RoleModuless.associate(models);

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully');
});

module.exports = models;
