
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommentAttachment = sequelize.define('CommentAttachment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

CommentAttachment.associate = (models) => {
  CommentAttachment.belongsTo(models.Comment, {
    foreignKey: 'commentId',
    as: 'comment',
  });
};

module.exports = CommentAttachment;


