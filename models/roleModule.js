const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoleModule=sequelize.define("RoleModule",{
    id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
    roleId:{type:DataTypes.INTEGER,allowNull:false},
    moduleId:{type:DataTypes.INTEGER,allowNull:false},
});


module.exports=RoleModule;