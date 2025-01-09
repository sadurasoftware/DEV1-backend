const db = require("../config/db")
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
    const { username, email, password } = req.body;
  
    
    if (!username ) {
      return res.status(400).json({ message: 'Please provide username' });
    }
    if (!email ) {
        return res.status(400).json({ message: 'Please provide email.' });
      }
      if ( !password) {
        return res.status(400).json({ message: 'Please provide password.' });
      }
  
    // Check if the username already exists
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      if (results.length > 0) {
        return res.status(400).json({ message: 'Username is already taken.' });
      }
  
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 8);
  
      // Insert the new user into the database
      const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      const values = [username, email, hashedPassword];
  
      db.query(sql, values, (err, result) => {
        if (err) {
          console.error('Error inserting user into database:', err);
          return res.status(500).json({ message: 'Error registering user' });
        }
  
        // Respond with success and the new user ID
        res.status(201).json({
          message: 'User registered successfully',
          userId: result.insertId,
        });
      });
    });
  };

  module.exports = { register };