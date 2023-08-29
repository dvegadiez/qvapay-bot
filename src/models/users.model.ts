import { Model, DataTypes, Sequelize } from "sequelize";
import Umbral from "./umbrales.model";

export default class User extends Model {
  static asociateModels(){
    User.hasMany(Umbral);
}

public static inicialize(sequelize: Sequelize){

    User.init({
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            field: "id", 
            allowNull: false, 
            autoIncrement: false
          }, 
          first_name: {
            type: DataTypes.STRING(255),
          }, 
          last_name: {
            type: DataTypes.STRING(255),
          }, 
          username: {
            type: DataTypes.STRING(255),
          }, 
          activo: {
            type: DataTypes.BOOLEAN,
          }, 
    
        }, { 
          sequelize, modelName:'user'
      });
  } 
}





