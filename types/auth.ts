export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
}

export interface UserInfo {
  id: string;
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
