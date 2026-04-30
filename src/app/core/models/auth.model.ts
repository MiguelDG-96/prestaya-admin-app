export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  role: string;
  clientId?: string;
  authorities: string[];
}

export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  role: string;
  clientId: string;
  authorities: string[];
}
