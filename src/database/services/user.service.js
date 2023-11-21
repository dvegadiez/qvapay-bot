const Umbral = require("../models/umbrales.model");
const User = require("../models/users.model");
const { Op } = require("sequelize");

async function actualizarCrearUsuario(id, defaultConfig) {
  try {
    const [usuario, creado] = await User.findOrCreate({
        where: { id },
        defaults: {
          id, 
          firstName: defaultConfig.first_name,
          lastName: defaultConfig.last_name,
          userName: defaultConfig.username,
          activo: defaultConfig.activo,
        }
      });
  
    if(!creado){
      usuario.set({activo: true})
      return await usuario.save();
    }
    
    const umbrales = await Umbral.bulkCreate(defaultConfig.umbrales.map(umbral => {
      return {
        moneda: umbral.moneda, 
        venta: umbral.venta, 
        compra: umbral.compra, 
      }
    }))
  
    return await usuario.addUmbrals(umbrales)
    
  } catch (error) {
    console.log(error);
  }    
}

async function obtenerUsuarioPorId(id){
  try {
    return await User.findByPk(id, { include: Umbral})
  } catch (error) {
    console.log(error);
  }  
}

async function obtenerUsuariosActivos(){
  try {
    return await User.findAll({where: {activo: true}, include: Umbral})
  } catch (error) {
    console.log(error);
  }  
}

async function cambiarEstadoUsuario(id, estado) {
  try {
    return await User.update({activo: estado}, { where: { id }})
  } catch (error) {
    console.log(error);
  }
}

async function obtenerUmbralesUsuario(id) {
  try {
    return await obtenerUsuarioPorId(id)
    
  } catch (error) {
    console.log(error);
    
  }
}

async function actualizarUmbralUsuario(id, valoresUmbral) {
  try {
    const {moneda, venta, compra, cantidadMinima, cantidadMaxima} = valoresUmbral;
    
    return await Umbral.update({venta: isNaN(venta) ? null : venta, compra: isNaN(compra) ? null : compra, cantidadMinima, cantidadMaxima}, { where: { [Op.and]: {UserId: id, moneda}}})
    
  } catch (error) {
    console.log(error);  
  }
}

module.exports = { actualizarCrearUsuario, obtenerUsuarioPorId, cambiarEstadoUsuario, obtenerUmbralesUsuario, actualizarUmbralUsuario, obtenerUsuariosActivos }; 