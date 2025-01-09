const express = require("express");
const bodyParser = require('body-parser');
const db = require("./config/db.js")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const userRoutes = require("./routes/userRoutes.js")

// express app creation
const app = express();

// cross platform
app.use(cors());

// Middleware Json
app.use(bodyParser.json());

app.use("/api/users", userRoutes);


// Set up server to listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});