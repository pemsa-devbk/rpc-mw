

export interface AccountResponse{
    CodigoCte: string;
    CodigoAbonado: string;
    CodigoReceptora: number;
    Nombre: string;
    Direccion: string;
    Status: string;
    panel?: Panel;
    particiones?: Partition[];
    zonas?: Zone[];
    datosGeneralesDetallados?: GeneralData;
    seguridad?: Security;
    usuarios?: User[];
    contactos?: Contact[];
    emails?: Array<string>;
    horario?: Scheduled;
}
export interface Scheduled{
    VerificaApertura: boolean;
    VerificaCierre: boolean;
    HorariosApertura: Array<string>;
    HorariosCierre: Array<string>;
    CheckAntesApertura: boolean;
    CheckdespuesApertura: boolean;
    CheckAntesCierre: boolean;
    CheckDespuesCierre: boolean;
    ToleranciaAperturaAntes: string;
    ToleranciaAperturaDespues: string;
    ToleranciaCierreAntes: string;
    ToleranciaCierreDespues: string;
}

export interface Panel{
    Modelo: string;
    AccesoPorGPRS: boolean;
    AccesoPorIP: boolean;
    AccesoPorLinea: boolean;
    SinEnlace: boolean;
    CoordGPS: string;
}
export interface Partition {
    CodigoParticion: number;
    NombreParticion: string;
}
export interface Zone{
    CodigoZona: string;
    Descripcion: string;
    Observacion: string;
    Dispositivo1?: string;
    Cantidad1?: number;
    Dispositivo2?: string;
    Cantidad2?: number;
    Dispositivo3?: string;
    Cantidad3?: number;
}
export interface GeneralData{
    Estado: string;
    Ubicacion: string;
    Municipio: string;
}
export interface Security{
    PalabraDeSeg: string;
    PalabraDeSegTA: string;
    Amago: string;
}
export interface User{
    CodigoUsuario: string;
    NombreUsuario: string;
    Clave: string;
    ObservacionUsuario: string;
}
export interface Contact{
    Orden: number;
    Telefono: string;
    Contacto: string;
    PalabraDeSeg: string;
    Observaciones: string;
    CodigoAutoridad: number;
}