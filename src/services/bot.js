const { Bot, session } = require("grammy");
const ApiQvapay = require("./api-qvapay");

const {
  actualizarCrearUsuario,
  cambiarEstadoUsuario,
  obtenerUmbralesUsuario,
  actualizarUmbralUsuario,
  obtenerUsuariosActivos,
} = require("../database/services/user.service");
const TasaCambioApi = require("./cambio-monedas");

class TelegramBot {

  constructor(token) {
    this.token = token;
    this.bot = new Bot(token);
    this.bot.use(session());
    this.botId = undefined;

    this.setCommands([
      { command: "start", description: "Iniciar el bot" },
      { command: "stop", description: "Detener el bot" },
      { command: "config", description: "Configurar prámetros" },
      { command: "get", description: "Leer configuración" },
      { command: "tasas", description: "Obtener tasas de cambio" },
    ])
    .then(()=> this.bot.init())
    .then(()=> this.botId = this.bot.botInfo.id)
    .then(()=> this.bot.start())
    .catch((error)=>{
      console.log('Error al iniciar el bot: ', error)
    })

  }

  esMensajeConfiguracionValido(msg) {
    // Definimos la expresión regular para validar el formato
    const patron =
      /^(BANK_CUP|BANK_MLC):(null|[0-9]+(\.[0-9]+)?):((null|[0-9]+(\.[0-9]+)?))$/;

    // Verificamos si la msg coincide con el patrón
    return patron.test(msg);
  }

  async setCommands(comandos) {
    try {
      await this.bot.api.setMyCommands(comandos);
    } catch (error) {
      console.log("Error al crear los comandos del bot!!!");
    }

    // Envia mensaje de bienvenida al recibir el comando /start
    this.bot.command("start", (ctx) => {
      const { id } = ctx.chat;
      const { first_name, last_name, username } = ctx.update.message.from;
      const palabraSecreta = ctx.match;
      if (palabraSecreta !== process.env.BOT_SHARED_KEY) {
        return;
      }

      const defaultUserConfig = {
        id,
        first_name,
        last_name,
        username,
        activo: true,
        umbrales: [
          { moneda: "BANK_CUP", venta: 235, compra: null },
          { moneda: "BANK_MLC", venta: 1.11, compra: null },
        ],
      };

      actualizarCrearUsuario(id, defaultUserConfig)
        .then((data) => {
          console.log(
            `Usuario ${data.firstName}(${data.id}) activado con éxito.`
          );
          const msg = `<a href="tg://user?id=${this.botId}">Bot Ofertas P2P Qvapay</a>\n\r<b>¡Bienvenido a nuestro bot de Telegram!</b>\n\r<strong>Hola ${data.firstName}!</strong> Gracias por unirte a nuestro bot. Estamos <u>emocionados</u> de tenerte aquí.\n\r- Explora nuestras funciones.\n\r- No dudes en contactarnos si tienes alguna pregunta.\n\r¡Disfruta tu experiencia!`
          this.bot.api.sendMessage(
            id,
            msg, 
            { parse_mode: "HTML" },
          );
        })
        .catch((err) => {
          console.log(err);
        });
    });

    // Desactiva el id del usuario al recibir el comando /stop
    this.bot.command("stop", (ctx) => {
      const { id } = ctx.chat;
      const { first_name, last_name, username } = ctx.update.message.from;

      cambiarEstadoUsuario(id, false)
        .then((data) => {
          console.log(`Usuario ${first_name}(${id}), deshabilitado con éxito`);
          if (data) {
            const msg = `<a href="tg://user?id=${this.botId}">Bot Ofertas P2P Qvapay</a>\n\rBye Bye, <b>${first_name}</b>`
            this.bot.api.sendMessage(id, msg, { parse_mode: "HTML" },);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });

    this.bot.command("tasas", (ctx) => {
      const { id } = ctx.chat;
      const coin = ctx.match || 'BANK_CUP';

      const api = new ApiQvapay();

      api
        .obtenerTasasCambio(coin)
        .then(({ average_buy, average_sell, median_buy, median_sell }) => {
          const msg = `<a href="tg://user?id=${this.botId}">Bot Ofertas P2P Qvapay</a>\n\r<b>Tasas de Cambio </b> <i>${coin}</i>\n\r<b>Promedio Ventas:</b> ${average_sell.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}\n\r<b>Promedio Compras:</b> ${average_buy.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}\n\r<b>Mediana Ventas:</b> ${median_sell.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}\n\r<b>Mediana Compras</b>: ${median_buy.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;

          this.bot.api.sendMessage(id, msg, {parse_mode: 'HTML'});
        })
        .catch((error) => {
          console.log(error);
        });
    });

    this.bot.command("get", (ctx) => {
      const { id } = ctx.chat;
      const param = ctx.match;

      if (param === "all") {
        obtenerUsuariosActivos()
          .then((usuarios) => {
            if (!usuarios.length) return;

            usuarios.forEach((usuario) => {
              const umbrales = usuario["Umbrals"];
              const { firstName, lastName } = usuario;
              let mensaje = `<a href="tg://user?id=${this.botId}">Bot Ofertas P2P Qvapay</a>\n\r<b>Usuario:</b> ${firstName} ${lastName}\n\r`;

              umbrales.forEach((umbral) => {
                const { moneda, venta, compra } = umbral;
                mensaje = mensaje.concat(
                  `<b>Moneda:</b> ${moneda}\n\r<b>Venta:</b> ${venta},\n\r<b>Compra:</b> ${compra},\n\r`
                );
              });
              this.bot.api.sendMessage(
                id,
                umbrales ? mensaje : "Configuración de usuario no encontrada!!!",
                {parse_mode:'HTML'}
              );
            });
          })
          .catch((err) => {
            console.log(err);
          });
        return;
      }

      obtenerUmbralesUsuario(id)
        .then((data) => {
          const umbrales = data["Umbrals"];
          let mensaje = `<a href="tg://user?id=${this.botId}">Bot Ofertas P2P Qvapay</a>\n\r`;

          umbrales?.forEach((umbral) => {
            mensaje = mensaje.concat(
              `<b>Moneda:</b> ${umbral.moneda}\n\r<b>Venta:</b> ${umbral.venta},\n\r<b>Compra:</b> ${umbral.compra},\n\r`
            );
          });
          this.bot.api.sendMessage(
            id,
            umbrales
              ? mensaje
              : "Configuración de usuario no encontrada. Debe iniciar el bot!!!",
            {parse_mode:"HTML"}  
          );
        })
        .catch((error) =>
          console.log(`Error al leer la configuración de usuario: ${error}`)
        );
    });

    this.bot.command("config", (ctx) => {
      const { id } = ctx.chat;
      const palabraConfiguracion = ctx.match;

      if (!palabraConfiguracion) {
        ctx.reply(
          `<a href="tg://user?id=${this.botId}">Bot Ofertas P2P Qvapay</a>\n\rPara configurar los umbrales del bot, envía argumentos al comando con el siguiente formato:\n\r/config BANK_MLC:venta:compra\n\rEnvía null si no quieres recibir notificaciones del alguna operación`, 
          {parse_mode: "HTML"}
        ).then(()=>{
          return ctx.reply(`
          /config BANK_MLC:1.10:null
          `);
        }).then(()=> {
          ctx.reply(`
          /config BANK_CUP:235:215
          `);         
        });

        return;
      } else if (!this.esMensajeConfiguracionValido(palabraConfiguracion)) {
        ctx.reply("La configuración recibida no tiene el formato correcto.");
        return;
      }

      const [moneda, venta, compra] = palabraConfiguracion.split(":");

      const umbral = { moneda, venta, compra };
      actualizarUmbralUsuario(id, umbral)
        .then((data) => {
          if (!data) {
            console.log("Error al actualizar umbrales de usuario");
            return;
          }

          this.bot.api.sendMessage(
            id,
            "Configuración actualizada correctamente!!!"
          );
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  enviarNotificacionOfertas(id, oferta, firstName) {
    const { uuid, type, coin, amount, receive } = oferta;
    const msg = `<a href="tg://user?id=${this.botId}">Bot Ofertas P2P Qvapay</a>\n\r<b>Oferta Qvapay</b>\n\rTipo Operación: ${type === "sell" ? "Venta" : "Compra"}\n\rMoneda: ${coin}\n\rCantidad: ${(+amount).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}\n\rImporte: ${(+receive).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}\n\rRatio: ${(+receive / +amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}\n\rAplicar: https://qvapay.com/p2p/${uuid}`;
    console.log(`Notificación enviada al usuario: ${firstName}`);
    this.bot.api.sendMessage(id, msg, {parse_mode: "HTML", disable_web_page_preview: true});
  }
}

module.exports = TelegramBot;
