const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const Department=sequelize.define("Department",{
        id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
        name:{
        type:DataTypes.STRING,
        allowNull:false}
});

Department.associate = (models) => {
  Department.hasMany(models.User, { foreignKey: 'departmentId', as: 'users' });
};

module.exports = Department;