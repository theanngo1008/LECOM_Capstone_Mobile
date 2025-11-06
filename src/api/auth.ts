import { ApiResponse } from "../types/common";
import { apiClient } from "./client";
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  userId: string;
}
export type LoginResponse = ApiResponse<LoginResult>;

export interface RegisterRequest {
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  password: string;
}

export interface RegisterResult {
  message: string;
}
export type RegisterResponse = ApiResponse<RegisterResult>;

export const authApi = {
  /**
   * POST /api/Auth/login
   * Đăng nhập và lấy token
   */
  login: async (input: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>("/Auth/login", input)
    return data
  },
  /**
   * POST /api/Auth/register
   * Đăng ký tài khoản mới
   */
  register: async (input: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>(
      "/Auth/register",
      input
    )
    return data
  },
}