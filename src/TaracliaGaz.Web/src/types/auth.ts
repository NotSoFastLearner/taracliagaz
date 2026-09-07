export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAtUtc: string;
  userId: string;
  userName: string;
  role: string;
}

export interface RegisterRequest {
  userName: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  userId: string;
  userName: string;
  role: string;
}

export interface AuthUser {
  token: string;
  expiresAtUtc: string;
  userId: string;
  userName: string;
  role: string;
  isGuest: boolean;
}
