const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
  firstname: { type: DataTypes.STRING, allowNull: false },
  lastname: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING,allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }, 
  roleId:{ type:DataTypes.INTEGER, allowNull:false  },
  departmentId: { type: DataTypes.INTEGER, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN,defaultValue: true},
  last_LoggedIn: { type: DataTypes.DATE, allowNull: true},
  terms: { type: DataTypes.BOOLEAN, allowNull: false ,defaultValue:false}, 
});

User.associate = models => {
  User.hasMany(models.UserInfo, {
    foreignKey: 'userId',
    as: 'usersInfo', 
  })
  User.belongsTo(models.Role, {
    foreignKey: 'roleId',
    as: 'role',
  });
  User.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department',
  });
  User.hasMany(models.Ticket, {
    foreignKey: 'createdBy',
    as: 'createdTickets',
  });

  User.hasMany(models.Ticket, {
    foreignKey: 'assignedTo',
    as: 'assignedTickets',
  });
  User.hasMany(models.Comment, {
    foreignKey: 'updatedBy',
    as: 'commentedTickets',
  });
}

module.exports = User;
