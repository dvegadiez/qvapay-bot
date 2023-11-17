const axios = require("axios");

class ApiQvapay {

  constructor(){
    this.baseUrl = 'https://qvapay.com/api';
    this.ofertas = [];
    this.accessToken = '';
  }

  async login(email, password){
    const data = JSON.stringify({
      "email": email,
      "password": password
    });

    const url = `${this.baseUrl}/auth/login`;

    const config = {
      headers: { 
        'Accept': 'application/json', 
        'Content-Type': 'application/json'
      },
    };

    try {
      const response = await axios.post(url, data, config);
      
      return response;

    } catch (error) {

      if (axios.isAxiosError(error)) {
        const axiosError = error;
        if (axiosError.response?.status === 422) {
          return axiosError.response;
        }
      }
      
      throw error;
    }

  }

  async obtenerOfertas(paramUrl){
    if( !paramUrl ){
      this.ofertas = [];
    }
    const url = paramUrl || `${this.baseUrl}/p2p/index`;

    const config = {
      headers: { 
        'Accept': 'application/json', 
        'Authorization': `Bearer ${this.accessToken}`
      }   
    };
    
    try {
      const response  = await axios.get(url, config);
      const { next_page_url, current_page, from, to, data } = response.data;
      this.ofertas.push(...data);
      //Procesar aqui las ofertas de la pagina actual
      console.log(`Ofertas de la ${from} a la ${to} (página ${current_page})`);
      
      //Si existe una página siguiente vuelve a buscar
      if( next_page_url ){
        await this.obtenerOfertas(next_page_url);
      }      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error;
        if (axiosError.response?.status === 401) {
          return axiosError.response;
        }
      }
      
      throw error;
    }
  }

  async obtenerTasasCambio( coin = 'BANK_CUP'){
    const url = `${this.baseUrl}/p2p/completed_pairs_average?coin=${coin }`;
    const config = {
      headers: { 
        'Accept': 'application/json', 
      }   
    };

    try {
      const response  = await axios.get(url, config);
      const { average_buy, average_sell, median_buy, median_sell } = response.data;

      return {
        average_buy, 
        average_sell, 
        median_buy, 
        median_sell
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error;
        console.log(axiosError.response);
      }
      
      throw error;
    }
  }
  
}

module.exports = ApiQvapay;

