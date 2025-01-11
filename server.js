const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require("./routes/authRoutes.js")
const port = 5000;

// Create Express app
const app = express();

// cross platform
app.use(cors());

// Middlewares
app.use(bodyParser.json());
app.use(express.json()); 

// Use user routes
app.use('/api', userRoutes);
app.use('/api/auth',authRoutes)

// Set up server to listen on port
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});