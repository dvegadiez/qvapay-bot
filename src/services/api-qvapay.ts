import axios, { Axios, AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";
import { ErrorResponse, SuccessfullLogin, UserInfo } from "../interfaces/login";
import { Oferta, OfertasResponse } from "../interfaces/ofertas";

export class ApiQvapay {
  baseUrl: string = '';
  accessToken: string = '';
  ofertas: Oferta[];

  constructor(baseUrl: string){
    this.baseUrl = baseUrl;
    this.ofertas = [];
  }

  async login(email: string, password: string){
    const data = JSON.stringify({
      "email": email,
      "password": password
    });

    const url = `${this.baseUrl}/auth/login`;

    const config: AxiosRequestConfig = {
      headers: { 
        'Accept': 'application/json', 
        'Content-Type': 'application/json'
      },
    };

    try {
      const response : AxiosResponse<SuccessfullLogin> = await axios.post<SuccessfullLogin>(url, data, config);
      
      return response;

    } catch (error) {

      if (axios.isAxiosError(error)) {
        const axiosError: AxiosError<ErrorResponse> = error;
        if (axiosError.response?.status === 422) {
          return axiosError.response;
        }
      }
      
      throw error;
    }

  }

  async obtenerOfertas(paramUrl? : string){
    if( !paramUrl ){
      this.ofertas = [];
    }
    const url = paramUrl || `${this.baseUrl}/p2p/index`;

    const config: AxiosRequestConfig = {
      headers: { 
        'Accept': 'application/json', 
        'Authorization': `Bearer ${this.accessToken}`
      }   
    };
    
    try {
      const response : AxiosResponse<OfertasResponse> = await axios.get<OfertasResponse>(url, config);
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
        const axiosError: AxiosError<ErrorResponse> = error;
        if (axiosError.response?.status === 401) {
          return axiosError.response;
        }
      }
      
      throw error;
    }
  }
  
}

