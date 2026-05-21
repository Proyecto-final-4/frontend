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

export interface EncryptedLoginPayload {
  encryptedEmail: string;
  encryptedPassword: string;
}

export interface EncryptedRegisterPayload {
  encryptedName: string;
  encryptedEmail: string;
  encryptedPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
