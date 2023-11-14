const axios = require("axios");

class TasaCambioApi {
  baseUrl = 'https://www.cambiocup.com/api';

  constructor(){
  }

  async obtenerTasasCambio(){
    
    const url = this.baseUrl;

    const config = {
      headers: { 
        'Accept': 'application/json', 
      }   
    };
    
    try {
      const response  = await axios.get(url, config);
      const { cupHistory, mlcHistory } = response.data;
      const [cupLast, ...cupRest] = cupHistory;
      const [mlcLast, ...mlcRest] = mlcHistory;

      return {
        cupLast, 
        mlcLast
      }
    } catch (error) {
     
      console.log(error);
    }
  }
  
}

module.exports = TasaCambioApi;