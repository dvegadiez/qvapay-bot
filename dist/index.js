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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.procesarOfertas = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const api_qvapay_1 = require("./services/api-qvapay");
const bot_1 = require("./services/bot");
const fichero_configuracion_1 = require("./services/fichero-configuracion");
const baseUrl = 'https://qvapay.com/api';
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.get('/', (req, res) => {
    res.send('Bienvenido al Bot de Ofertas P2P de Qvapay (no oficial)');
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
const api = new api_qvapay_1.ApiQvapay(baseUrl);
const email = process.env.QVAPAY_USER;
const password = process.env.QVAPAY_PASSWORD;
const telegramApiKey = process.env.TELEGRAM_APIKEY;
const telegramBot = new bot_1.TelegramBot(telegramApiKey);
telegramBot.setCommands([
    { command: "start", description: "Iniciar el bot" },
    { command: "stop", description: "Detener el bot" },
    { command: "config", description: "Configurar prámetros" },
    { command: "get", description: "Leer configuración" },
]);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const loginResponse = yield api.login(email, password);
        if (loginResponse.status !== 200) {
            const { error } = loginResponse.data;
            console.log(`Error de autenticación. ${error}`);
            return;
        }
        console.log('Autenticación correcta');
        const { accessToken } = loginResponse.data;
        api.accessToken = accessToken;
        yield api.obtenerOfertas();
        const ofertas = api.ofertas;
        procesarOfertas(ofertas);
    });
}
function procesarOfertas(ofertas) {
    return __awaiter(this, void 0, void 0, function* () {
        function filtrarOfertas(oferta) {
            var _a;
            const { config } = this;
            const { coin, type, amount, receive } = oferta;
            const ratio = (+receive) / (+amount);
            if (!((_a = config[coin]) === null || _a === void 0 ? void 0 : _a[type])) {
                return false;
            }
            // Verificar el umbral de acuerdo a la operación
            if (type === 'sell' && ratio > config[coin][type]) {
                return false;
            }
            if (type === 'buy' && ratio < config[coin][type]) {
                return false;
            }
            return true;
        }
        const fichero = new fichero_configuracion_1.FicheroConfiguracion();
        const configuracionUsuarios = fichero.leerDatos();
        if (Object.keys(configuracionUsuarios).length !== 0)
            Object.keys(configuracionUsuarios).forEach(id => {
                const config = configuracionUsuarios[id];
                const ofertasFiltradas = ofertas.filter(filtrarOfertas, { config });
                //Recorre las ofertas y envia una notificacion por cada una.
                ofertasFiltradas.forEach(oferta => telegramBot.enviarNotificacionOfertas(Number(id), oferta));
            });
    });
}
exports.procesarOfertas = procesarOfertas;
main();
setInterval(main, 3 * 60 * 1000);
