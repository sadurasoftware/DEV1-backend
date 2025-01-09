const mysql = require('mysql2');
const dotenv = require('dotenv');


dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,  
    user: process.env.DB_USER,  
    password: process.env.DB_PASSWORD,  
    database: process.env.DB_NAME  
  });

// Connect to MySQL
db.connect((err) => {
    if (err) {
      console.error('Database connection failed:', err);
      return;
    }
    console.log('MySQL database connected.');
  });
  
module.exports= db;