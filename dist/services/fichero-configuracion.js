"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FicheroConfiguracion = void 0;
const fs = __importStar(require("fs"));
class FicheroConfiguracion {
    constructor(pathToFile) {
        FicheroConfiguracion.nombreFichero = pathToFile || 'src/data/users.cfg';
    }
    leerDatos() {
        try {
            const data = fs.readFileSync(FicheroConfiguracion.nombreFichero);
            return JSON.parse(data.toString());
        }
        catch (err) {
            console.error(err);
        }
    }
    salvarDatos(data) {
        const jsonData = JSON.stringify(data);
        try {
            fs.writeFileSync(FicheroConfiguracion.nombreFichero, jsonData);
            console.log("La configuración ha sido salvada exitosamente!");
        }
        catch (err) {
            console.error(err);
        }
    }
    leerDatosUsuario(idUsuario) {
        const datos = this.leerDatos();
        return datos[idUsuario] || undefined;
    }
    insertarUsuario(idUsuario, datosUsuario) {
        const datos = this.leerDatos();
        datos[idUsuario] = JSON.parse(datosUsuario);
        this.salvarDatos(datos);
    }
    eliminarUsuario(idUsuario) {
        const datos = this.leerDatos();
        delete datos[idUsuario];
        this.salvarDatos(datos);
    }
    actualizarDatosUsuario(idUsuario, moneda, operacion, valorUmbral) {
        const datos = this.leerDatos();
        if (!datos[idUsuario][moneda]) {
            datos[idUsuario][moneda] = {};
        }
        datos[idUsuario][moneda][operacion] = valorUmbral;
        this.salvarDatos(datos);
    }
}
exports.FicheroConfiguracion = FicheroConfiguracion;
