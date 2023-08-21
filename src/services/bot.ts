import { Bot } from "grammy";
import { FicheroConfiguracion } from "./fichero-configuracion";
import { Oferta } from "../interfaces/ofertas";

export class TelegramBot {
  token: string ;
  bot: Bot; 
  fichero: FicheroConfiguracion;

  constructor(token: string) {
    const defaultConfig = {
      BANK_CUP: { sell: 260 }
    }

    this.token = token;
    this.bot = new Bot(token);
    this.fichero = new FicheroConfiguracion();

    // Envia mensaje de bienvenida al recibir el comando /start 
    this.bot.command('start', (ctx) => {
      const { id } = ctx.chat;
      this.bot.api.sendMessage(id, "Bienvenido al Bot de notificaciones de ofertas p2p Qvapay");
      this.fichero.insertarUsuario(id.toString(), JSON.stringify(defaultConfig));
    });

    // Borrar el id del chat al recibir el comando /stop  
    this.bot.command('stop', (ctx) => {
      const { id } = ctx.chat;
      this.bot.api.sendMessage(id, "Bye, Bye");
      this.fichero.eliminarUsuario(id.toString());
    });

    this.bot.command('get', (ctx) => {
      const { id } = ctx.chat;
  
      const configuracionUsuario = this.fichero.leerDatosUsuario(id.toString());
      this.bot.api.sendMessage(id, configuracionUsuario ? JSON.stringify(configuracionUsuario) : 'Configuración de usuario no encontrada. Debe iniciar el bot!!!');
    
    });

    this.bot.command('config', (ctx) => {
      const { id } = ctx.chat;
      const palabraConfiguracion = ctx.match;

      if(!palabraConfiguracion){
        ctx.reply("Para configurar los umbrales del bot, envía argumentos al comando con el siguiente formato:");
        ctx.reply( `/config BANK_MLC:sell:1.15`)
        ctx.reply( `/config BANK_CUP:buy:215.00`);

        return ;
      }

      else if (!this.esMensajeConfiguracionValido(palabraConfiguracion)){
        ctx.reply("La configuración recibida no tiene el formato correcto.");
        return;
      }

      const [moneda, operacion, umbral] = palabraConfiguracion.split(':');
      const valorUmbral = Number(umbral);
      console.log(moneda, operacion, valorUmbral);
      this.fichero.actualizarDatosUsuario(id.toString(), moneda, operacion, valorUmbral.toString());
      this.bot.api.sendMessage(id, 'Configuración actualizada correctamente!!!');
    
    });



    this.bot.start();
  }

  esMensajeConfiguracionValido(msg: string) {
    // Definimos la expresión regular para validar el formato
    const patron = /^(BANK_CUP|BANK_MLC):(sell|buy):[0-9]+(\.[0-9]+)?$/;
  
    // Verificamos si la msg coincide con el patrón
    return patron.test(msg);
  }
  
  async setCommands(comandos: {command: string; description: string}[]) {
    await this.bot.api.setMyCommands(comandos);
  }

  enviarNotificacionOfertas( id: number, oferta: Oferta ){
    const { uuid, type, coin, amount, receive } = oferta;
    const msg = 
    `
      Oferta Qvapay
    Tipo Operación: ${type === 'sell' ? 'Venta' : 'Compra'}
    Moneda: ${ coin }
    Cantidad: ${ (+amount).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2}) }
    Importe: ${ (+receive).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2}) }
    Ratio: ${ ((+ receive)/ ( + amount )).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }
    Aplicar: https://qvapay.com/p2p/${uuid}
    `

    this.bot.api.sendMessage(id, msg);
  }
  
}

