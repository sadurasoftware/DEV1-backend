const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');


// Create Express app
const app = express();
app.use(cors());
const port = 5000;

// Middlewares
app.use(bodyParser.json());
app.use(express.json()); 


// Use user routes
app.use('/api', userRoutes);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
