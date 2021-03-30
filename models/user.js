const { Model, DataTypes } = require("sequelize");
const sequelize = require('../sequelize');

class User extends Model {}

User.init({
    tgId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'User',
});

module.exports = User;
