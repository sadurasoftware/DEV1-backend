const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }, 
  roleId:{ type:DataTypes.INTEGER, allowNull:false  }
});

User.associate = models => {
  User.belongsTo(models.Role, {
    foreignKey: 'roleId',
    as: 'role',
  })
}

module.exports = User;
