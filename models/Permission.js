const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const Permission=sequelize.define("Permission",{
    id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true,},
    name:{type:DataTypes.STRING,allowNull:false,unique:true}
});


module.exports=Permission;