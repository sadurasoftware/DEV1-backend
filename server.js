const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require("./routes/authRoutes.js")
const cookieParser = require('cookie-parser');
// Create Express app
const app = express();

const corsOptions = {
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
};
// cross platform
app.use(cors(corsOptions));

// Middlewares
app.use(bodyParser.json());
app.use(express.json()); 
app.use(cookieParser());
// Use user routes
app.use('/api', userRoutes);
app.use('/api/auth',authRoutes)

// Set up server to listen on port
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});