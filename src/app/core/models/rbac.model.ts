export interface Rol {
  id: number;
  nombre: string;
}

export interface Modulo {
  id: number;
  nombre: string;
  label: string;
}

export interface DetalleRolModulo {
  id?: number;
  rol: Rol;
  modulo: Modulo;
  pView: boolean;
  pCreate: boolean;
  pUpdate: boolean;
  pDelete: boolean;
  pMenu: boolean;
}
