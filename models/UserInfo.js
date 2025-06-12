const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserInfo = sequelize.define('UserInfo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    profilePicture: {
        type: DataTypes.STRING, 
        allowNull: true,
      },
    gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other'),
        allowNull: true,
      },
      blood_group: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    designationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    country_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    state_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    location_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    timestamps: true
  });

  UserInfo.associate = models => {
    UserInfo.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'users',
    });
    UserInfo.belongsTo(models.Designation, {
      foreignKey: 'designationId',
      as: 'designation',
    });
    UserInfo.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByUser',
    });
   UserInfo.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByUser',
    });
    UserInfo.belongsTo(models.Country, {
      foreignKey: 'country_id',
      as: 'country',
    });
    UserInfo.belongsTo(models.State, {
      foreignKey: 'state_id',
      as: 'state',
    });
    UserInfo.belongsTo(models.Branch, {
      foreignKey: 'branch_id',
      as: 'branch',
    });
  };

  module.exports = UserInfo;