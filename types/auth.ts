export interface AuthResponse {
  token: string;
  id: number;
  name: string;
  email: string;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
