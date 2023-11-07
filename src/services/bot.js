const { Bot } = require("grammy");

const { actualizarCrearUsuario, cambiarEstadoUsuario, obtenerUmbralesUsuario, actualizarUmbralUsuario } = require('../database/services/user.service');

class TelegramBot {
  token = '';
  bot = undefined;

  constructor(token) {

    this.token = token;
    this.bot = new Bot(token);

    this.setCommands([
      { command: "start", description: "Iniciar el bot" },
      { command: "stop", description: "Detener el bot" },
      { command: "config", description: "Configurar prámetros" },
      { command: "get", description: "Leer configuración" },
    ]);

    this.bot.start();
  }

  esMensajeConfiguracionValido(msg) {
    // Definimos la expresión regular para validar el formato
    const patron = /^(BANK_CUP|BANK_MLC):(null|[0-9]+(\.[0-9]+)?):((null|[0-9]+(\.[0-9]+)?))$/;

    // Verificamos si la msg coincide con el patrón
    return patron.test(msg);
  }

  async setCommands(comandos) {
    // await this.bot.api.setMyCommands(comandos);

    // Envia mensaje de bienvenida al recibir el comando /start
    this.bot.command("start", (ctx) => {
      const { id } = ctx.chat;
      const { first_name, last_name, username } = ctx.update.message.from;
      
      const palabraSecreta = ctx.match;
      if (palabraSecreta !== process.env.BOT_SHARED_KEY) {
        return;
      }

      const defaultUserConfig = {
        id, first_name, 
        last_name, 
        username, 
        activo: true,
        umbrales: [
          { moneda: 'BANK_CUP', venta: 235, compra: null},
          { moneda: 'BANK_MLC', venta: 1.11, compra: null}
        ]
      };

      actualizarCrearUsuario(id, defaultUserConfig)
        .then((data) =>{
          console.log(`Usuario ${ data.firstName }(${data.id}) activado con éxito.`);
          this.bot.api.sendMessage(id, `Bienvenido ${data.firstName}, al bot de notificaciones de ofertas P2P de Qvapay (No oficial).`);
        })
        .catch((err)=>{
          console.log(err);
        })
    });

    // Desactiva el id del usuario al recibir el comando /stop
    this.bot.command("stop", (ctx) => {
      const { id } = ctx.chat;
      const { first_name, last_name, username } = ctx.update.message.from;

      cambiarEstadoUsuario(id, false).then((data)=>{
        console.log(`Usuario ${ first_name }(${id}), deshabilitado con éxito`)
        
        if(data){
          this.bot.api.sendMessage(id, `Bye Bye, ${ first_name }`);
        }         
      })
      .catch((err)=>{
        console.log(err);
        
      })
    });

    this.bot.command("get", (ctx) => {
      const { id } = ctx.chat;

      obtenerUmbralesUsuario(id)
        .then((data)=>{
          
          const umbrales = data['Umbrals'];
          let mensaje = '';

          umbrales?.forEach((umbral) =>{
            mensaje = mensaje.concat(
              `
               Moneda: ${umbral.moneda}
               Venta: ${umbral.venta}, 
               Compra: ${umbral.compra}, 
               `)
              })
          this.bot.api.sendMessage(
            id,
            umbrales
              ? mensaje
              : "Configuración de usuario no encontrada. Debe iniciar el bot!!!"
          );
        })
        .catch((error)=> console.log(`Error al leer la configuración de usuario: ${error}`))
    });

    this.bot.command("config", (ctx) => {
      const { id } = ctx.chat;
      const palabraConfiguracion = ctx.match;

      if (!palabraConfiguracion) {
        ctx.reply(
          `Para configurar los umbrales del bot, envía argumentos al comando con el siguiente formato:
          /config BANK_MLC:venta:compra
          Envía null si no quieres recibir notificaciones del alguna operación
          `
        );
        ctx.reply(`
        /config BANK_MLC:1.10:null
        `);
        ctx.reply(`
        /config BANK_CUP:235.00:215.00
        `);

        return;
      } else if (!this.esMensajeConfiguracionValido(palabraConfiguracion)) {
        ctx.reply("La configuración recibida no tiene el formato correcto.");
        return;
      }

      const [moneda, venta, compra] = palabraConfiguracion.split(":");

      const umbral = { moneda, venta, compra}
      actualizarUmbralUsuario(id, umbral)
        .then((data)=>{
          if(!data){
            console.log('Error al actualizar umbrales de usuario');
            return;
          }
            
          this.bot.api.sendMessage(
            id,
            "Configuración actualizada correctamente!!!"
          );
        })
        .catch((err)=>{
          console.log(err);
          
        })
    });
  }

  enviarNotificacionOfertas(id, oferta) {
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

module.exports = TelegramBot;
