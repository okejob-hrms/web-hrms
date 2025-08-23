export interface IUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
}

export interface ILoginResponse {
  user: IUser;
  token: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}
