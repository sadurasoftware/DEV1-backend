const sequelize = require('../config/database');
//const bcrypt = require('bcrypt');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const Module = require('./Module');
const RoleModulePermission = require('./RoleModulePermission');
const Department = require('./Department');
const Ticket = require('./Ticket');
const models = { User, Role, Permission, Module, RoleModulePermission, Department, Ticket };

if (User.associate) {
  User.associate(models);
}
if (Role.associate) {
  Role.associate(models);
}
if (Permission.associate) {
  Permission.associate(models);
}
if (Module.associate) {
  Module.associate(models);
}
if (RoleModulePermission.associate) {
  RoleModulePermission.associate(models);
}
if (Department.associate) {
  Department.associate(models);
}
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
