import { Bot } from "grammy";
import { FicheroConfiguracion } from "./fichero-configuracion";
import { Oferta } from "../interfaces/ofertas";
import userRespository from "../repositories/user.respository";
import { UserAtributos } from "../interfaces/user.interface";

export class TelegramBot {
  token: string;
  bot: Bot;
  fichero: FicheroConfiguracion;

  constructor(token: string) {

    this.token = token;
    this.bot = new Bot(token);
    this.fichero = new FicheroConfiguracion();

    this.setCommands([
      { command: "start", description: "Iniciar el bot" },
      { command: "stop", description: "Detener el bot" },
      { command: "config", description: "Configurar prámetros" },
      { command: "get", description: "Leer configuración" },
    ]);

    this.bot.start();
  }

  esMensajeConfiguracionValido(msg: string) {
    // Definimos la expresión regular para validar el formato
    const patron = /^(BANK_CUP|BANK_MLC):(sell|buy):[0-9]+(\.[0-9]+)?$/;

    // Verificamos si la msg coincide con el patrón
    return patron.test(msg);
  }

  async setCommands(comandos: { command: string; description: string }[]) {
    // await this.bot.api.setMyCommands(comandos);

    // Envia mensaje de bienvenida al recibir el comando /start
    this.bot.command("start", (ctx) => {
      const { id } = ctx.chat;
      const { first_name, last_name, username } = ctx.update.message!.from;
      
      const palabraSecreta = ctx.match;
      if (palabraSecreta === process.env.BOT_SHARED_KEY) {
        const defaultUserConfig: UserAtributos = {
          id, first_name, 
          last_name, 
          username, 
          activo: true,
          umbrales: [
            { moneda: 'BANK_CUP', venta: 250, compra: null, activo: true, userId: id },
            { moneda: 'BANK_MLC', venta: 1.13, compra: null, activo: true, userId: id }
          ]
        };

      
        // userRespository.encontrarCrearUsuario(id, defaultUserConfig)
        // .then(([usuario, creado]) =>{
        //   return creado ? new Promise(()=> {}) : userRespository.actualizarEstadoUsuario(id, true)
        // })
        // .then(()=> {
        //   console.log(`Usuario @${username} creado o activado correctamente`)
        //   this.bot.api.sendMessage(
        //     id,
        //     `Bienvenido @${username}, al Bot de notificaciones de ofertas p2p Qvapay`
        //   );
        // })
        // .catch((error)=> console.log(`Error al adicionar o activar usuario. ${error}`));
      }
    });

    // Borrar el id del chat al recibir el comando /stop
    this.bot.command("stop", (ctx) => {
      const { id } = ctx.chat;
      const { username } = ctx.update.message!.from;

      userRespository.actualizarEstadoUsuario(id, false)
        .then((usuariosActualizados)=> {
          this.bot.api.sendMessage(id, "Bye, Bye");
          console.log(`Usuario @${username} desactivado correctamente`)
        })
        .catch((error)=> console.log(`Error al desactivar usuario: ${error}`))
    });

    // this.bot.command("get", (ctx) => {
    //   const { id } = ctx.chat;

    //   userRespository.obtenerUsuarioPorId(id)
    //   .then((usuarioEncontrado) => {
    //       let mensaje = '';
    //       if(usuarioEncontrado){
    //         const umbrales = usuarioEncontrado.;
    //         umbrales?.forEach((umbral: UmbralesAtributos) =>{
    //           mensaje = mensaje.concat(
    //             `Moneda: ${umbral.moneda}
    //             Venta: ${umbral.venta}, 
    //             Compra: ${umbral.compra}, 
    //             Activo: ${umbral.activo}
                
    //             `)
    //         })
    //       }
    //       this.bot.api.sendMessage(
    //         id,
    //         usuarioEncontrado
    //           ? mensaje
    //           : "Configuración de usuario no encontrada. Debe iniciar el bot!!!"
    //       );
    //     })
    //   .catch((error)=> console.log(`Error al leer la configuración de usuario: ${error}`))
    // });

    this.bot.command("config", (ctx) => {
      const { id } = ctx.chat;
      const palabraConfiguracion = ctx.match;

      if (!palabraConfiguracion) {
        ctx.reply(
          "Para configurar los umbrales del bot, envía argumentos al comando con el siguiente formato:"
        );
        ctx.reply(`
        /config BANK_MLC:sell:1.15
        /config BANK_CUP:buy:215.00
        `);

        return;
      } else if (!this.esMensajeConfiguracionValido(palabraConfiguracion)) {
        ctx.reply("La configuración recibida no tiene el formato correcto.");
        return;
      }

      const [moneda, operacion, umbral] = palabraConfiguracion.split(":");
      const valorUmbral = Number(umbral);
      //TODO: Validar si el valor es null, poner el registro de umbral en desactivado

      // userRespository.obtenerUsuarioPorId(id)
      //   .then((usuario)=>{
      //     if(!usuario){
      //       console.log('Usuario no encontrado');
      //       return;
      //     }

      //     usuario.umbrales.
      //   })

      // this.fichero.actualizarDatosUsuario(
      //   id.toString(),
      //   moneda,
      //   operacion,
      //   valorUmbral.toString()
      // );
      this.bot.api.sendMessage(
        id,
        "Configuración actualizada correctamente!!!"
      );
    });
  }

  enviarNotificacionOfertas(id: number, oferta: Oferta) {
    const { uuid, type, coin, amount, receive } = oferta;
    const msg = `
      Oferta Qvapay
    Tipo Operación: ${type === "sell" ? "Venta" : "Compra"}
    Moneda: ${coin}
    Cantidad: ${(+amount).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}
    Importe: ${(+receive).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}
    Ratio: ${(+receive / +amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}
    Aplicar: https://qvapay.com/p2p/${uuid}
    `;

    this.bot.api.sendMessage(id, msg);
  }
}
