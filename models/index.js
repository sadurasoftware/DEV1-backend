const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const RoleModule = require('./roleModule');
const Module = require('./Module');


const models = { User, Role, Module, RoleModule};

User.associate(models);
Role.associate(models);
Module.associate(models);
// Permission.associate(models);

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully');
});

module.exports = models;
