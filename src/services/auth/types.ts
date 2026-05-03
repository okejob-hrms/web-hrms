export interface IUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  is_first_login: boolean;
}

export interface ILoginResponse {
  user: IUser;
  token: string;
  roles: string[];
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IResetRequest { 
  email: string;
}

export interface IResetResponse { 
  message: string;
}

export interface IChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface IChangePasswordResponse {
  message: string;
}