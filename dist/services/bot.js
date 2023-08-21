"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramBot = void 0;
const grammy_1 = require("grammy");
const fichero_configuracion_1 = require("./fichero-configuracion");
class TelegramBot {
    constructor(token) {
        const defaultConfig = {
            BANK_CUP: { sell: 260 }
        };
        this.token = token;
        this.bot = new grammy_1.Bot(token);
        this.fichero = new fichero_configuracion_1.FicheroConfiguracion();
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
            if (!palabraConfiguracion) {
                ctx.reply("Para configurar los umbrales del bot, envía argumentos al comando con el siguiente formato:");
                ctx.reply(`/config BANK_MLC:sell:1.15`);
                ctx.reply(`/config BANK_CUP:buy:215.00`);
                return;
            }
            else if (!this.esMensajeConfiguracionValido(palabraConfiguracion)) {
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
    esMensajeConfiguracionValido(msg) {
        // Definimos la expresión regular para validar el formato
        const patron = /^(BANK_CUP|BANK_MLC):(sell|buy):[0-9]+(\.[0-9]+)?$/;
        // Verificamos si la msg coincide con el patrón
        return patron.test(msg);
    }
    setCommands(comandos) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bot.api.setMyCommands(comandos);
        });
    }
    enviarNotificacionOfertas(id, oferta) {
        const { uuid, type, coin, amount, receive } = oferta;
        const msg = `
      Oferta Qvapay
    Tipo Operación: ${type === 'sell' ? 'Venta' : 'Compra'}
    Moneda: ${coin}
    Cantidad: ${(+amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
    Importe: ${(+receive).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
    Ratio: ${((+receive) / (+amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    Aplicar: https://qvapay.com/p2p/${uuid}
    `;
        this.bot.api.sendMessage(id, msg);
    }
}
exports.TelegramBot = TelegramBot;
