import * as fs from "fs";

export class FicheroConfiguracion {
    static nombreFichero: string;

    constructor(pathToFile?: string ) {
        FicheroConfiguracion.nombreFichero = pathToFile || 'src/data/users.cfg';
    }

    leerDatos(){
        try{ 
            const data = fs.readFileSync(FicheroConfiguracion.nombreFichero);
            return JSON.parse(data.toString());
        } catch (err) { 
            console.error(err); 
        } 
    }

    salvarDatos( data: any){
        const jsonData: string = JSON.stringify(data); 
        try { 
            fs.writeFileSync(FicheroConfiguracion.nombreFichero, jsonData); 
            console.log("La configuración ha sido salvada exitosamente!"); 
        } catch (err) { 
            console.error(err); 
        } 
    }

    leerDatosUsuario(idUsuario: string){
        const datos = this.leerDatos();
        return datos[idUsuario] || undefined;
    }

    insertarUsuario(idUsuario: string, datosUsuario: string){
        const datos = this.leerDatos();
        datos[idUsuario] = JSON.parse(datosUsuario);
        this.salvarDatos(datos);
    }

    eliminarUsuario(idUsuario: string){
        const datos = this.leerDatos();
        delete datos[idUsuario];
        this.salvarDatos(datos);
    }

    actualizarDatosUsuario(idUsuario: string, moneda: string, operacion: string, valorUmbral: string){
        const datos = this.leerDatos();

        if(!datos[idUsuario][moneda]){
            datos[idUsuario][moneda] = {};
        }
    
        datos[idUsuario][moneda][operacion] = valorUmbral;
        
        this.salvarDatos(datos);
    }
}
