const axios = require("axios");

class ApiQvapay {
  baseUrl = '';
  accessToken = '';
  ofertas;

  constructor(baseUrl){
    this.baseUrl = baseUrl;
    this.ofertas = [];
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
  
}

module.exports = ApiQvapay;

