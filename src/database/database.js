const Sequelize = require('sequelize');

const dbConnectionString = process.env.DATABASE_URL; 
const sequelize = new Sequelize( dbConnectionString, {
    define: {
        freezeTableName: true, 
      }
} );

module.exports = sequelize ;

