export interface Client {
  id: string;
  name: string;
  dni: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  createdAt: string;
}

export interface ClientCreateRequest {
  name: string;
  dni: string;
  phone: string;
  email: string;
  address: string;
}
