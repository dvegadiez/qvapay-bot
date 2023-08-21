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
exports.ApiQvapay = void 0;
const axios_1 = __importDefault(require("axios"));
class ApiQvapay {
    constructor(baseUrl) {
        this.baseUrl = '';
        this.accessToken = '';
        this.baseUrl = baseUrl;
        this.ofertas = [];
    }
    login(email, password) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
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
                const response = yield axios_1.default.post(url, data, config);
                return response;
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    const axiosError = error;
                    if (((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 422) {
                        return axiosError.response;
                    }
                }
                throw error;
            }
        });
    }
    obtenerOfertas(paramUrl) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!paramUrl) {
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
                const response = yield axios_1.default.get(url, config);
                const { next_page_url, current_page, from, to, data } = response.data;
                this.ofertas.push(...data);
                //Procesar aqui las ofertas de la pagina actual
                console.log(`Ofertas de la ${from} a la ${to} (página ${current_page})`);
                //Si existe una página siguiente vuelve a buscar
                if (next_page_url) {
                    yield this.obtenerOfertas(next_page_url);
                }
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    const axiosError = error;
                    if (((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                        return axiosError.response;
                    }
                }
                throw error;
            }
        });
    }
}
exports.ApiQvapay = ApiQvapay;
