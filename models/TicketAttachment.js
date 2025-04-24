
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketAttachment = sequelize.define('TicketAttachment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ticketId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

TicketAttachment.associate = (models) => {
  TicketAttachment.belongsTo(models.Ticket, {
    foreignKey: 'ticketId',
    as: 'ticket',
  });
};

module.exports = TicketAttachment;
