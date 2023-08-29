import { Model, DataTypes, Sequelize } from "sequelize";
import User from "./users.model";

export default class Umbral extends Model {
  static asociateModels(){
    Umbral.belongsTo(User)  
}

public static inicialize(sequelize: Sequelize){

    Umbral.init({
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          field: "id", 
          allowNull: false, 
          autoIncrement: false
        }, 
        moneda: {
          type: DataTypes.STRING(255),
        }, 
        venta: {
          type: DataTypes.FLOAT,
        }, 
        compra: {
          type: DataTypes.FLOAT,
        },
        activo: {
          type: DataTypes.BOOLEAN,
        }
        }, { 
          sequelize, modelName:'umbral'
    })
  }
}

