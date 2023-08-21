export interface OfertasResponse {
    current_page:   number;
    data:           Oferta[];
    first_page_url: string;
    from:           number;
    last_page:      number;
    last_page_url:  string;
    links:          Link[];
    next_page_url:  string;
    path:           string;
    per_page:       number;
    prev_page_url:  null;
    to:             number;
    total:          number;
}

export interface Oferta {
    id:         number;
    uuid:       string;
    user_id:    number;
    type:       Type;
    coin:       Coin;
    peer_id:    number;
    amount:     string;
    receive:    string;
    status:     string;
    created_at: Date;
    updated_at: Date;
    coin_data:  CoinData;
    peer:       Peer;
    owner:      Owner;
}

export interface CoinData {
    id:                  number;
    coins_categories_id: number;
    name:                string;
    logo:                string;
    tick:                string;
    fee_in:              string;
    fee_out:             string;
    min_in:              string;
    min_out:             string;
    price:               string;
}

export interface Owner {
    uuid:               string;
    username:           string;
    name:               string;
    lastname:           string;
    email:              string;
    bio:                string;
    profile_photo_path: null | string;
    profile_photo_url:  string;
    complete_name:      string;
    name_verified:      string;
}

export interface Peer {
    name:               string;
    username:           string;
    profile_photo_path: string;
    profile_photo_url:  string;
    complete_name:      string;
    name_verified:      string;
}

export enum Type {
    Buy = "buy",
    Sell = "sell",
}

export enum Coin {
  BTC = "BTC",
  LTC = "LTC",
  ETH = "ETH",
  BCH = "BCH",
  DASH = "DASH",
  DOGE = "DOGE",
  TRX = "TRX",
  PAYEER = "PAYEER",
  BNB = "BNB",
  AIRTM = "AIRTM",
  ZELLE = "ZELLE",
  BTCLN = "BTCLN",
  BUSDBSC = "BUSDBSC",
  BNBBSC = "BNBBSC",
  CAKE = "CAKE",
  ADA = "ADA",
  XMR = "XMR",
  XRP = "XRP",
  XNO = "XNO",
  MATICMAINNET = "MATICMAINNET",
  SOL = "SOL",
  PAYPAL = "PAYPAL",
  UPHOLD = "UPHOLD",
  CASHAPP = "CASHAPP",
  SBERBANK = "SBERBANK",
  BANK_LATAM = "BANK_LATAM",
  BANK_EUR = "BANK_EUR",
  BANK_MLC = "BANK_MLC",
  BANK = "BANK",
  BANK_CUP = "BANK_CUP",
  SHIB = "SHIB",
  DAI = "DAI",
  USDC = "USDC",
  TRVL = "TRVL",
  PM = "PM",
  ETECSA = "ETECSA",
  HIVE = "HIVE",
  TON = "TON",
  RVN = "RVN",
  MYBAMBU = "MYBAMBU",
  TROPIPAY = "TROPIPAY",
  RevoluPay = "RevoluPay",
  WebMoney = "WebMoney",
  LINK = "LINK",
  CRO = "CRO",
  BOLSATM = "BOLSATM",
  TUSD = "TUSD",
  ALGO = "ALGO",
  BNBMAINNET = "BNBMAINNET",
  AVAX = "AVAX",
  AVA = "AVA",
  DOT = "DOT",
  USDTERC20 = "USDTERC20",
  USDTSOL = "USDTSOL",
  HBD = "HBD",
  XTZ = "XTZ",
  APPLECASH = "APPLECASH",
}

export interface Link {
    url:    null | string;
    label:  string;
    active: boolean;
}
