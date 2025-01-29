const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully');
});

module.exports = { User, Role };
