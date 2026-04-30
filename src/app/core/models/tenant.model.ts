export interface Tenant {
  id: string;
  name: string;
  phone: string;
  dni: string;
  address: string;
  roomNumber: string;
  email?: string;
  active: boolean;
  createdAt: string;
}

export interface TenantCreateRequest {
  name: string;
  phone: string;
  dni: string;
  address: string;
  roomNumber: string;
  email?: string;
}
