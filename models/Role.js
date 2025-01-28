const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

Role.associate = models => {
 
  Role.hasMany(models.User, {
    foreignKey: 'roleId',
    // onDelete: 'CASCADE', // Optional: delete all users with this role when the role is deleted
  });
};

module.exports = Role;
