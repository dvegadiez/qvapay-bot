const { DataTypes, Model } = require('sequelize');
const sequelize = require('./../database');

class Umbral extends Model {

}

Umbral.init({
  // Model attributes are defined here

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  moneda: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  venta: {
    type: DataTypes.FLOAT
    // allowNull defaults to true
  },
  compra: {
    type: DataTypes.FLOAT,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'Umbral', // We need to choose the model name
  timestamps: false,
  tableName: 'umbrales'
});

module.exports = Umbral;