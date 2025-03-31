const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const helmet = require('helmet');
const { apiLimiter } = require('./middlewares/rateLimit');
const logger = require('./config/logger');
const { errorHandler } = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const roleModulePermissionRoutes = require('./routes/rolemodulepermissionRoutes');
const department=require('./routes/departmentRoutes')
const ticketRoutes=require('./routes/ticketRoutes')
const categoryRoutes=require('./routes/categoryRoutes')
const serverless = require("serverless-http");
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 
app.use(
  session({
    secret:process.env.SESSION_SECRET || 'defaultSecret', 
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, 
      secure: true,
      sameSite: 'Strict', 
      maxAge: 1000 * 60 * 60 * 24, 
    },
  })
);

app.use(morgan('tiny'));  
app.use(helmet());  
const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  // Allow cookies and authorization headers to be included
};

app.use(cors(corsOptions));

app.use('/api/', apiLimiter);  
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', userRoutes);
app.use('/api/super-admin', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/role-module-permissions', roleModulePermissionRoutes);
app.use('/api/department',department)
app.use('/api/tickets',ticketRoutes)
app.use('/api/category',categoryRoutes)
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(err.status || 500).json({ message: 'Internal Server Error' });
});
app.get('/', (req, res) => {
  res.send('Welcome to the Node.js Application vercel deployment successfully');
});

app.use(errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    const sequelize = require('./config/database');
    await sequelize.authenticate();
    logger.info(`Connected to the database successfully.`);
    logger.info(`Server is running at http://localhost:${PORT}`);
  } catch (error) {
    logger.error('Error connecting to the database:', error.message);
  }
});

//module.exports.handler = serverless(app);
module.exports=app
