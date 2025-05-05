const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketHistory = sequelize.define('TicketHistory', {
    ticketId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    oldValue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    newValue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    changedBy: {
      type: DataTypes.INTEGER, 
      allowNull: true,
    }
  }, {
    timestamps: true
  });
  
TicketHistory.associate = (models) => {
    TicketHistory.belongsTo(models.User, {
      foreignKey: 'changedBy',
      as: 'user',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  
    TicketHistory.belongsTo(models.Ticket, {
      foreignKey: 'ticketId',
      as: 'ticket',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };
  
module.exports = TicketHistory;