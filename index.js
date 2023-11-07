const express = require('express')
const dotenv = require('dotenv');

const ApiQvapay = require("./src/services/api-qvapay");
const TelegramBot = require("./src/services/bot");

const sequelize = require("./src/database/database");
const { obtenerUsuariosActivos } = require('./src/database/services/user.service');
const User = require("./src/database/models/users.model");
const Umbral = require("./src/database/models/umbrales.model");

async function main() {

  const loginResponse = await api.login(email, password);  

  if(loginResponse.status !== 200){
    const { error } = loginResponse.data
    console.log(`Error de autenticación. ${error}`);
    return;
  }

  console.log('Autenticación correcta');
  const { accessToken } = loginResponse.data;
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

async function procesarOfertas (ofertas) {
  function filtrarOfertas(oferta) {
    const { config } = this;
    const { coin, type, amount, receive } =  oferta;
    const ratio =  (+ receive)/ ( + amount ) ;

    if (!(config[coin]?.[type])) {
        return false;
    }
    
    // Verificar el umbral de acuerdo a la operación
    if (type === 'sell' && !isNaN(config[coin][type]) && ratio > config[coin][type]) {
        return false;
    }
    
    if (type === 'buy' && !isNaN(config[coin][type]) && ratio < config[coin][type]) {
        return false;
    }

    return true;
  }

  obtenerUsuariosActivos()
    .then((usuarios)=>{
      if(!usuarios.length)
        return;

      usuarios.forEach((usuario) => {
        const umbrales = usuario['Umbrals'];
        const { id } = usuario;
        const config = {};

        umbrales.forEach((umbral) => {
          const { moneda, venta, compra, UserId} = umbral;
          config[moneda] = {};   
          config[moneda]['sell'] = parseFloat(venta);
          config[moneda]['buy'] = parseFloat(compra);
          
        });
        const ofertasFiltradas = ofertas.filter(filtrarOfertas, {config});
        ofertasFiltradas.forEach(oferta => telegramBot.enviarNotificacionOfertas(id, oferta))
      });
    })
    .catch((err)=>{
      console.log(err);
      
    })  

}


dotenv.config();

const baseUrl = 'https://qvapay.com/api';
const api = new ApiQvapay(baseUrl);
const email = process.env.QVAPAY_USER;
const password = process.env.QVAPAY_PASSWORD;
const telegramApiKey = process.env.TELEGRAM_APIKEY;

const app = express();
const port = process.env.PORT  ?? 8080;

app.get('/', (req, res) => {
  res.send('Bienvenido al Bot de Ofertas P2P de Qvapay (no oficial)');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

testDbConection();

User.hasMany(Umbral);
Umbral.belongsTo(User);

sequelize.sync({alter: true});
const telegramBot = new TelegramBot(telegramApiKey);

main();
setInterval(main, 3 * 60 * 1000);

