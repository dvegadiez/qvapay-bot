export interface UserAtributos {
    id: number;
    first_name: string;
    last_name: string | undefined;
    username: string | undefined;
    activo: boolean;
    umbrales: UmbralesAtributos[];
}

export interface UmbralesAtributos {
    id?: number;
    moneda: string;
    venta: number | null;
    compra: number | null;
    activo: boolean;
    userId?: number;
}