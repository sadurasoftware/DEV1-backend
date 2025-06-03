const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CreateUser = sequelize.define('CreateUser', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName :{
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password :{
      type: DataTypes.STRING,
      allowNull: true,
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
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    departmentId: {
      type: DataTypes.INTEGER,
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
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    terms: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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

  CreateUser.associate = models => {
    CreateUser.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role',
    });
  
    CreateUser.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department',
    });
  
    CreateUser.belongsTo(models.Designation, {
      foreignKey: 'designationId',
      as: 'designation',
    });
  
    CreateUser.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByUser',
    });
  
    CreateUser.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByUser',
    });
    CreateUser.belongsTo(models.Country, {
      foreignKey: 'country_id',
      as: 'country',
    });
    CreateUser.belongsTo(models.State, {
      foreignKey: 'state_id',
      as: 'state',
    });
    CreateUser.belongsTo(models.Branch, {
      foreignKey: 'branch_id',
      as: 'branch',
    });
  };

  module.exports = CreateUser;