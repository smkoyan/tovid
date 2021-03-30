const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Record extends Model {}

Record.init({
    cases: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    recovered: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    active: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    createdAt: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        unique: true,
    },
}, {
    timestamps: false,
    sequelize,
    modelName: 'Record',
});

module.exports = Record;

