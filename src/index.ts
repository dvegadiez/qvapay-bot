import express, { Express, Request, Response } from "express";
import dotenv from 'dotenv';
import { ApiQvapay } from "./services/api-qvapay";
import { ErrorResponse, SuccessfullLogin } from "./interfaces/login";
import { TelegramBot } from "./services/bot";
import { Oferta } from "./interfaces/ofertas";
import { FicheroConfiguracion } from "./services/fichero-configuracion";
import User from "./models/users.model";
import Umbral from "./models/umbrales.model";

const sequelize = require("./database/database");

async function main() {

  const loginResponse = await api.login(email, password);  

  if(loginResponse.status !== 200){
    const { error } = <ErrorResponse>loginResponse.data
    console.log(`Error de autenticación. ${error}`);
    return;
  }

  console.log('Autenticación correcta');
  const { accessToken } = <SuccessfullLogin> loginResponse.data;
  api.accessToken = accessToken;
  
  await api.obtenerOfertas();
  const ofertas = api.ofertas;

  procesarOfertas(ofertas);
}

async function testDbConection(){
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

export async function procesarOfertas (ofertas: Oferta[]) {
  function filtrarOfertas(this: { config: Record<string, any> }, oferta: Oferta) {
    const { config } = this;
    const { coin, type, amount, receive } =  oferta;
    const ratio =  (+ receive)/ ( + amount ) ;

    if (!(config[coin]?.[type])) {
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
  const fichero = new FicheroConfiguracion();

  const configuracionUsuarios = fichero.leerDatos();
    if(Object.keys(configuracionUsuarios).length !== 0)
        Object.keys(configuracionUsuarios).forEach(id => {
            const config = configuracionUsuarios[id];

            const ofertasFiltradas = ofertas.filter(filtrarOfertas, {config});
            //Recorre las ofertas y envia una notificacion por cada una.
            ofertasFiltradas.forEach(oferta => telegramBot.enviarNotificacionOfertas(Number(id), oferta))
            
        })
}


dotenv.config();

const baseUrl: string = 'https://qvapay.com/api';
const api = new ApiQvapay(baseUrl);
const email: string = <string> process.env.QVAPAY_USER;
const password: string = <string> process.env.QVAPAY_PASSWORD;
const telegramApiKey = <string> process.env.TELEGRAM_APIKEY;

const app: Express = express();
const port = process.env.PORT  ?? 8080;

app.get('/', (req: Request, res: Response) => {
  res.send('Bienvenido al Bot de Ofertas P2P de Qvapay (no oficial)');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

testDbConection();
User.inicialize(sequelize);
Umbral.inicialize(sequelize);

User.asociateModels();
Umbral.asociateModels();

sequelize.sync();
const telegramBot = new TelegramBot(telegramApiKey);

main();
setInterval(main, 3 * 60 * 1000);

