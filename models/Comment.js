const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment',{
    ticketId: {
        type: DataTypes.UUID,
        allowNull: false
      },
    commentText: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    timestamps: true 
  }
);

Comment.associate = (models) => {
  Comment.belongsTo(models.Ticket, {
    foreignKey: 'ticketId',
    onDelete: 'CASCADE'
  });

  Comment.belongsTo(models.User, {
    foreignKey: 'updatedBy',
    as: 'commenter'
  });
  Comment.hasMany(models.CommentAttachment, {
    foreignKey: 'commentId',
    as: 'attachments'
  });
};

module.exports = Comment;

