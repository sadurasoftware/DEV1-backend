const { DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachment: {
    type: DataTypes.STRING, 
    defaultValue: null
  },
  priority: {
    type: DataTypes.ENUM("Low", "Medium", "High"),
    allowNull: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("Open", "In Progress", "Resolved", "Closed","Pending"),
    defaultValue: 'Open'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assignedTo: {
    type: DataTypes.INTEGER
  }
}, { timestamps: true });

Ticket.associate = (models) => {
  Ticket.belongsTo(models.Category, {
    foreignKey: 'categoryId',
    as: 'category'
  });
  Ticket.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'user'
  });
  Ticket.belongsTo(models.User, {
    foreignKey: 'assignedTo',
    as: 'assignedUser'
  });
};



module.exports = Ticket;
