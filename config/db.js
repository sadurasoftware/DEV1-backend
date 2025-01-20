const { Sequelize } = require('sequelize');
const dotenv = require("dotenv");

dotenv.config();

// set up Sequelize connection to MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME,       
  process.env.DB_USER,      
  process.env.DB_PASSWORD,   
  {
    host: process.env.DB_HOST, 
    dialect: 'mysql',          

  }
);
 
sequelize.authenticate()
  .then(() => {
    console.log('Connected to the database.');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

// Export the db object for use in other parts of your application
module.exports = sequelize;