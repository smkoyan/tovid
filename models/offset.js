const { Model, DataTypes } = require("sequelize");
const sequelize = require('../sequelize');

class Offset extends Model {}

Offset.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
    },
},{
    sequelize,
    modelName: 'Offset',
    timestamps: false,
});

module.exports = Offset;
