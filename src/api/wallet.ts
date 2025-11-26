import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// =======================
// TYPES
// =======================

export interface WalletBalanceResult {
  customerId: string
  balance: number
  totalRefunded: number
  totalSpent: number
  totalWithdrawn: number
  lastUpdated: string
}

export type WalletBalanceResponse = ApiResponse<WalletBalanceResult>

// =======================
// WALLET API
// =======================

export const walletApi = {
  getBalance: async (): Promise<WalletBalanceResponse> => {
    const { data } = await apiClient.get<WalletBalanceResponse>(
      "/wallet/customer/balance"
    )
    return data
  },
}
