const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Country = sequelize.define('Country', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

Country.associate = models => {
    Country.hasMany(models.State, {
        foreignKey: 'countryId',
        as: 'states',
        onDelete: 'CASCADE',
    });
};

module.exports = Country;