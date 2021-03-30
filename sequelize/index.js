const { Sequelize } = require("sequelize");

/*const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './tovid.db'
});*/

console.log(process.env.DATABASE_URL)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
});

module.exports = sequelize;
