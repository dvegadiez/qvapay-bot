const express = require('express')

const ApiQvapay = require("./services/api-qvapay");
const TelegramBot = require("./services/bot");

const sequelize = require("./database/database");
const { obtenerUsuariosActivos } = require('./database/services/user.service');
const User = require("./database/models/users.model");
const Umbral = require("./database/models/umbrales.model");

async function main() {

  const loginResponse = await api.login(email, password);  

  if(loginResponse.status !== 200){
    const { error } = loginResponse.data
    console.log(`Error de autenticación. ${error}`);
    return;
  }

  console.log('Autenticación correcta');
  const { accessToken, me } = loginResponse.data;
  api.accessToken = accessToken;
  await api.obtenerOfertas();
  const ofertas = api.ofertas;
  procesarOfertas(ofertas, me.golden_check);
}

async function testDbConection(){
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

async function procesarOfertas (ofertas, goldenCheck) {
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

    if(config[coin]['maximo'] && amount > config[coin]['maximo'])
      return false;

    if(config[coin]['minimo'] && amount < config[coin]['minimo'])
      return false;

    return true;
  }

  obtenerUsuariosActivos()
    .then((usuarios)=>{
      if(!usuarios.length)
        return;

      usuarios.forEach((usuario) => {
        const umbrales = usuario['Umbrals'];
        const { id, firstName } = usuario;
        const config = {};

        umbrales.forEach((umbral) => {
          const { moneda, venta, compra, UserId, cantidadMinima, cantidadMaxima} = umbral;
          config[moneda] = {};   
          config[moneda]['sell'] = parseFloat(venta);
          config[moneda]['buy'] = parseFloat(compra);
          config[moneda]['minimo'] = cantidadMinima;
          config[moneda]['maximo'] = cantidadMaxima;
        });
        const ofertasFiltradas = ofertas.filter(filtrarOfertas, {config});
        ofertasFiltradas.forEach(oferta => telegramBot.enviarNotificacionOfertas(id, oferta, firstName, goldenCheck))
      });
    })
    .catch((err)=>{
      console.log(err);
      
    })  

}

const baseUrl = '';
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
setInterval(main, 1 * 60 * 1000);

