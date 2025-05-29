const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Location = sequelize.define('Location', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        countryId: { 
            type: DataTypes.INTEGER,
            allowNull: false,
          },
        stateId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }, 
    });

    Location.associate = models => {
        Location.belongsTo(models.Country, {
            foreignKey: 'countryId',
            as: 'country',
          });
        Location.belongsTo(models.State, {
            foreignKey: 'stateId',
            as: 'state',
        });
        Location.hasMany(models.Branch, {
            foreignKey: 'locationId',
            as: 'branches',
            onDelete: 'CASCADE',
        });
    };
    
    module.exports = Location;