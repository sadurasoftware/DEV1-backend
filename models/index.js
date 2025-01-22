const sequelize = require('../config/database');
const User = require('./User');



sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully');
});

module.exports = { User };
