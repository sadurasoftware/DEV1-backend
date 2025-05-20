const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const State = sequelize.define('State', {
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
});

State.associate = models => {
    State.belongsTo(models.Country, {
        foreignKey: 'countryId',
        as: 'country',
    });
    State.hasMany(models.Location, {
        foreignKey: 'stateId',
        as: 'locations',
        onDelete: 'CASCADE',
    });
};

module.exports=State