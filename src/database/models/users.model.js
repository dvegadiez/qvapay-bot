const { DataTypes, Model } = require('sequelize');
const sequelize = require('./../database');

class User extends Model {

}

User.init({
  // Model attributes are defined here

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  lastName: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'User', // We need to choose the model name
  timestamps: false,
  tableName: 'usuarios'
});

module.exports = User;