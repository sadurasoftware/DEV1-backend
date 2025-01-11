const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors")
const authRoutes = require("./routes/authRoutes.js")

// express app creation
const app = express();

// cross platform
app.use(cors());

// Middleware Json
app.use(bodyParser.json());

app.use('/api/auth',authRoutes)


// Set up server to listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});