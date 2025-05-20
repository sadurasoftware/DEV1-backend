const sequelize = require('../config/database');
//const bcrypt = require('bcrypt');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const Module = require('./Module');
const RoleModulePermission = require('./RoleModulePermission');
const Department = require('./Department');
const Category = require('./Category');
const Ticket = require('./Ticket');
const Comment = require('./Comment')
const TicketAttachment = require('./TicketAttachment');
const TicketHistory = require('./TicketHistory');
const CommentAttachment = require('./CommentAttachment');
const Country = require('./Country');
const State = require('./State');
const Location = require('./Location');
const Branch = require('./Branch');
const models = {
   User, Role, Permission, Module, RoleModulePermission, Department,Category, Ticket,Comment ,TicketAttachment,CommentAttachment,TicketHistory,
   Country,State,Location,Branch
  };
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// async function createSuperAdmin() {
//   try {
//     const existingAdmin = await User.findOne({ where: { email: 'bala@gmail.com' } });

//     if (!existingAdmin) {
//       const hashedPassword = await bcrypt.hash('Balak123@', 10); // Encrypt password before saving

//       await User.create({
//         firstname: 'bala',
//         lastname: 'kumar',
//         email: 'bala@gmail.com',
//         password: hashedPassword,
//         isVerified:1,
//         roleId: 1,
//         terms: 1
//       });

//       console.log('SuperAdmin user created successfully.');
//     } else {
//       console.log('SuperAdmin already exists.');
//     }
//   } catch (error) {
//     console.error('Error creating SuperAdmin:', error);
//   }
// }

sequelize
  .sync({ alter: true, force: false })
  .then(() => {
    console.log('Database synced successfully');
    //createSuperAdmin(); 
  })
  .catch((error) => {
    console.error('Error syncing the database:', error);
  });

module.exports = models;
