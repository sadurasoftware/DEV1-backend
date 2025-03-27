const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('dev_db', 'admin', 'awsSadura#db123', {
  host: 'node-dev.cvi4kce4mqlf.us-east-1.rds.amazonaws.com',
  dialect: 'mysql',
  logging: console.log, 
});

module.exports = sequelize;
