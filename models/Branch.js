const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Branch = sequelize.define('Branch', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pincode :{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        locationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    Branch.associate = models => {
        Branch.belongsTo(models.Location, {
            foreignKey: 'locationId',
            as: 'location',
        });
    };
    
    module.exports = Branch;