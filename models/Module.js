const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const Module=sequelize.define("Module",{
    id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true,},
    name:{type:DataTypes.STRING,allowNull:false,unique:true}
});

Module.associate = (models) => {
    Module.belongsToMany(models.Role, {
      through: models.RoleModule,
      foreignKey: 'moduleId',
      as: 'roles',
    });
}

module.exports=Module;