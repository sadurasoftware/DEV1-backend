const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

Category.associate = models => {
  Category.hasMany(models.Ticket, {
    foreignKey: 'categoryId',
    as: 'tickets',
  });
};

module.exports = Category;
