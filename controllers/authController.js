const db = require("../config/db")
const {generateToken} = require("../utils/jwt");
const { verifyPassword } = require("../utils/hash")

const login = async (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide username and password.' });
  }

  // Check if the user exists
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    // If user doesn't exist, return an error
    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found.' });
    }

    const user = results[0];

    // Compare the provided password with the stored hashed password
    const passwordMatch = await verifyPassword(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Password is incorrect.' });
    }

    // Generate JWT token 
    const token=generateToken({ email });

    db.query('UPDATE users SET token = ? WHERE email = ?', [token, email], (err, result) => {
      if (err) {
        console.error('Error saving token:', err);
        return res.status(500).json({ message: 'Error saving token' });
      }
    });

    // Respond with success and the JWT token
    res.status(200).json({
      token, 
      username: user.username,
    });
  });

};

const logout = async(req,res)=>{
  const { token, username } = req.body;
  console.log(req.body);

  db.query('DELETE token from users Where username = ? ', [username], (err, result) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error in logout' });
    }
  });
  res.status(200).json({
    message:"User Loggedout"
  });

}

  module.exports = { login, logout };