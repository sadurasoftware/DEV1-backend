// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize('dev-db', 'admin', 'awsSadura#db123', {
//   host: 'dev-db.cvi4kce4mqlf.us-east-1.rds.amazonaws.com',
//   dialect: 'mysql',
//   logging: console.log, 
// });

// module.exports = sequelize;
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('dev-db', 'root', 'Balak5577@', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log, 
});

module.exports = sequelize;
