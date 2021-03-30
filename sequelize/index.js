const { Sequelize } = require("sequelize");

/*const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './tovid.db'
});*/

const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/tovid');

module.exports = sequelize;
