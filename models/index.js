const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');


const models = { User, Role, Permission };

User.associate(models);
Role.associate(models);


sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully');
});

module.exports = models;
