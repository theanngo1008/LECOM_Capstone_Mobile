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

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResult {
  message: string;
}

export type ResetPasswordResponse = ApiResponse<ResetPasswordResult>;

export interface RegisterResult {
  message: string;
}
export type RegisterResponse = ApiResponse<RegisterResult>;
// Step 2: xác nhận token và đặt mật khẩu mới
export interface ResetPasswordConfirmRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ResetPasswordConfirmResult {
  message: string;
}

export type ResetPasswordConfirmResponse =
  ApiResponse<ResetPasswordConfirmResult>;

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
  resetPassword: async (
  input: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const { data } = await apiClient.post<ResetPasswordResponse>(
    "/Auth/forget-password",
    input
  )
  return data
},
 // POST /Auth/reset-password/
  confirmResetPassword: async (
    input: ResetPasswordConfirmRequest
  ): Promise<ResetPasswordConfirmResponse> => {
    const { data } = await apiClient.post<ResetPasswordConfirmResponse>(
      "/Auth/reset-password",
      input
    );
    return data;
  },
}