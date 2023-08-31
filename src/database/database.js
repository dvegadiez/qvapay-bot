const dotenv = require('dotenv');
const Sequelize = require('sequelize');

dotenv.config();

const dbConnectionString = process.env.DATABASE_URL; 
const sequelize = new Sequelize( dbConnectionString, {
    define: {
        freezeTableName: true, 
      }
} );

module.exports = sequelize ;

