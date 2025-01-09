const db = require('../config/db');


const registerUser = (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).send('Please fill all the fields.');
    }
  
    // Check if the user already exists
    const insertUserQuery = 'SELECT * FROM new_table WHERE username = ?';
    db.query(insertUserQuery, [username], (err, result) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).send('Internal server error');
      }
  
      if (result.length > 0) {
        return res.status(400).send('User already exists.');
      }
  
      // Insert the new user into the database
      const insertUserQuery = 'INSERT INTO new_table (username, password) VALUES (?,?)';
      db.query(insertUserQuery, [username, password], (err) => {
        if (err) {
          console.error('Error inserting user into database:', err);
          return res.status(500).send('Internal server error');
        }
  
        res.status(200).send('User registered successfully');
      });
    });
  };
  
  module.exports = { registerUser };