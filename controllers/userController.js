const User = require('../models/registerUser');
const bcrypt = require('bcryptjs');


const registerUser = async (req, res) => {
    const { username, email, password, terms, theme } = req.body;

    const userTheme = theme || 'light';
    if (!username || !email || !password || terms  === undefined) {
      return res.status(400).send('Please fill all the fields.');
    }

    if (!terms) {
        return res.status(400).send('You must accept the terms and conditions.');
    }

    try {
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if the user already exists
        const existingUser = await User.findOne({
            where: {email:email},
        });
        
            if (existingUser) {
                return res.status(400).send('User already exists.');
            }

            // Insert the new user in database
            const newUser = await User.create({
                username, email, password:hashedPassword, terms, theme:userTheme
            });

            res.status(200).send('User registered successfully.');
        }
        catch(error){
            console.error('Error inserting user into database:', error);
            return res.status(500).send('Internal server error');
        }               
               
};

module.exports = { registerUser };
