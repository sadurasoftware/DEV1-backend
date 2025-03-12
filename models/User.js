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
  terms: { type: DataTypes.BOOLEAN, allowNull: false }, 
});

User.associate = models => {
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
}

module.exports = User;
