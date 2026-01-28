export interface User {
  id: string;
  email: string;
  role: 'tenant' | 'owner';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  role: 'tenant' | 'owner';
}

export interface AuthResponse {
  user: User;
  token: string;
}