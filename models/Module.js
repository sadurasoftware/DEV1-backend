const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");


const Module=sequelize.define("Module",{
    id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true,},
    name:{type:DataTypes.STRING,allowNull:false}
});


Module.associate = (models) => {
  Module.hasMany(models.RoleModulePermission, { foreignKey: 'moduleId', as: 'RoleModulePermissions' });
};
module.exports=Module;