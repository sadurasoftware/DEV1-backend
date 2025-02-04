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
    as: 'users',
    // onDelete: 'CASCADE', // Optional: delete all users with this role when the role is deleted
  });
  Role.belongsToMany(models.Permission, {
    through: models.RolePermission,
    foreignKey: 'roleId',
    as: 'permissions',
  });
};

module.exports = Role;
