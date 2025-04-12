const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const helmet = require('helmet');
const { apiLimiter } = require('./middlewares/rateLimit');
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
const commentRoutes=require('./routes/commentRoutes')
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
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  credentials: true, 
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
app.use('/api/comments',commentRoutes)
app.use((err, req, res, next) => {
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
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});

//module.exports.handler = serverless(app);
module.exports=app
