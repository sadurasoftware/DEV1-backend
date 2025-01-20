const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull:false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    terms: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    theme: {
        type: DataTypes.STRING,
        defaultValue: 'light'
    },
},
{
    timestamps: false,

})


module.exports = User;