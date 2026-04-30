export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  photoUrl: string;
  status: string;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  phone: string;
  password?: string;
  rolId: number;
  dni?: string;
  cargo?: string;
  salario?: number;
  fechaContratacion?: string;
  tipoContrato?: string;
}
