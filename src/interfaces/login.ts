
export interface SuccessfullLogin {
    accessToken: string;
    token_type:  string;
    me:          UserInfo;
}

export interface UserInfo {
    uuid:     string;
    username: string;
    name:     string;
    lastname: string;
    bio:      string;
    logo:     string;
    balance:  string;
    kyc:      number;
}

export interface ErrorResponse {
    error:    string
}
