import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// ============================
// TYPES
// ============================

export interface WithdrawalItem {
  id: string
  amount: number
  bankName: string
  bankAccountNumber: string
  bankAccountName: string
  status: string
  requestedAt: string
  approvedAt: string | null
  completedAt: string | null
  rejectionReason: string | null
  note: string | null
  adminNote: string | null
}

export interface WithdrawalListResult {
  items: WithdrawalItem[]
  pagination: {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

// ❗ Giữ nguyên theo yêu cầu
export type WithdrawalListResponse = ApiResponse<WithdrawalItem[]>

export interface CreateWithdrawalRequest {
  amount: number
  bankName: string
  bankAccountNumber: string
  bankAccountName: string
  bankBranch: string
  note?: string | null
}

// ============================
// API MODULE
// ============================

export const withdrawalApi = {
  // ⭐ CUSTOMER — GET withdrawals
  getMyWithdrawals: async (page: number = 1, pageSize: number = 20) => {
    const { data } = await apiClient.get<WithdrawalListResponse>(
      `/Withdrawal/customer/my-withdrawals?page=${page}&pageSize=${pageSize}`
    )
    return data
  },

  // ⭐ CUSTOMER — CREATE withdrawal
  createWithdrawal: async (payload: CreateWithdrawalRequest) => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      "/Withdrawal/customer/create",
      payload
    )
    return data
  },

  // ⭐ CUSTOMER — CANCEL withdrawal
  cancelCustomerWithdrawal: async (withdrawalId: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      `/Withdrawal/customer/cancel/${withdrawalId}`
    )
    return data
  },

  // ⭐ SHOP — GET withdrawals
  getMyShopWithdrawals: async (page: number = 1, pageSize: number = 20) => {
    const { data } = await apiClient.get<WithdrawalListResponse>(
      `/Withdrawal/shop/my-withdrawals?page=${page}&pageSize=${pageSize}`
    )
    return data
  },

  // ⭐ SHOP — CREATE withdrawal
  createShopWithdrawal: async (payload: CreateWithdrawalRequest) => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      "/Withdrawal/shop/create",
      payload
    )
    return data
  },

  // ⭐ SHOP — CANCEL withdrawal
  cancelShopWithdrawal: async (withdrawalId: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      `/Withdrawal/shop/cancel/${withdrawalId}`
    )
    return data
  },
}
