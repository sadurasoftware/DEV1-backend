const db = require('../config/db');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    const { username, email, password, terms } = req.body;
    console.log(req.body);

    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('terms:', terms);

    if (!username || !email || !password || terms === undefined) {
      return res.status(400).send('Please fill all the fields.');
    }

    if (!terms) {
        return res.status(400).send('You must accept the terms and conditions.');
    }

    try {
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if the user already exists
        const insertUserQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(insertUserQuery, [email], (err, result) => {
            if (err) {
                console.error('Error querying database:', err);
                return res.status(500).send('Internal server error');
            }

            if (result.length > 0) {
                return res.status(400).send('User already exists.');
            }

            // Insert the new user into the database
            const insertUserQuery = 'INSERT INTO users (username, email, password, terms) VALUES (?,?,?,?)';
            db.query(insertUserQuery, [username, email, hashedPassword, terms], (err) => {
                if (err) {
                    console.error('Error inserting user into database:', err);
                    return res.status(500).send('Internal server error');
                }

                res.status(200).send('User registered successfully');
            });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        return res.status(500).send('Error hashing the password');
    }
};

module.exports = { registerUser };
