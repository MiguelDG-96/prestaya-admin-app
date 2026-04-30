import { AuthResponse, User } from '../models/auth.model';

export class AuthMapper {
  static fromResponse(response: AuthResponse): User {
    return {
      id: response.id,
      name: response.name,
      email: response.email,
      phone: response.phone,
      photoUrl: response.photoUrl,
      role: response.role,
      clientId: response.clientId,
      authorities: response.authorities || [],
    };
  }
}
