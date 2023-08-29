import dotenv from 'dotenv';
import User from '../models/users.model';
import Umbral from '../models/umbrales.model';
const Sequelize = require('sequelize');

dotenv.config();

const dbConnectionString: string = <string> process.env.DATABASE_URL; 
const sequelize = new Sequelize( dbConnectionString );

module.exports = sequelize ;

