import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// =======================
// TYPES
// =======================

// ----- Customer Wallet Balance -----
export interface WalletBalanceResult {
  customerId: string
  balance: number
  totalRefunded: number
  totalSpent: number
  totalWithdrawn: number
  lastUpdated: string
}
// ----- Customer Wallet Transactions -----
export interface CustomerWalletTransaction {
  id: string
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string
  referenceId: string
  referenceType: string
  createdAt: string
  performedBy: string | null
}

export interface CustomerWalletTransactionList {
  walletId: string
  customerId: string
  balance: number
  totalRefunded: number
  totalSpent: number
  totalWithdrawn: number
  lastUpdated: string

  transactions: CustomerWalletTransaction[]

  pagination: {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export type CustomerWalletTransactionsResponse =
  ApiResponse<CustomerWalletTransactionList>


export type WalletBalanceResponse = ApiResponse<WalletBalanceResult>

// ----- Shop Wallet Summary -----
export interface ShopWalletSummary {
  shopId: number
  shopName: string
  availableBalance: number
  pendingBalance: number
  totalEarned: number
  totalWithdrawn: number
  totalRefunded: number
  pendingOrdersCount: number
  lastUpdated: string
}

export type ShopWalletSummaryResponse = ApiResponse<ShopWalletSummary>

// ----- Shop Wallet Transactions -----
export interface ShopWalletTransaction {
  id: string
  type: string
  amount: number
  balanceType: string
  balanceBefore: number
  balanceAfter: number
  description: string
  referenceId: string
  referenceType: string
  createdAt: string
  performedBy: string | null
}

export interface ShopWalletTransactionList {
  walletId: string
  shopId: number
  shopName: string
  availableBalance: number
  pendingBalance: number
  totalEarned: number
  totalWithdrawn: number
  totalRefunded: number
  lastUpdated: string
  transactions: ShopWalletTransaction[]
  pagination: {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export type ShopWalletTransactionsResponse =
  ApiResponse<ShopWalletTransactionList>

// =======================
// WALLET API
// =======================

export const walletApi = {
  // Customer wallet
  getBalance: async (): Promise<WalletBalanceResponse> => {
    const { data } = await apiClient.get<WalletBalanceResponse>(
      "/wallet/customer/balance"
    )
    return data
  },

  // Shop Summary
  getShopSummary: async (): Promise<ShopWalletSummaryResponse> => {
    const { data } = await apiClient.get<ShopWalletSummaryResponse>(
      "/wallet/shop/summary"
    )
    return data
  },

  // Shop Transactions
  getShopTransactions: async (
    page: number = 1,
    pageSize: number = 20
  ): Promise<ShopWalletTransactionsResponse> => {
    const { data } = await apiClient.get<ShopWalletTransactionsResponse>(
      `/wallet/shop/transactions?page=${page}&pageSize=${pageSize}`
    )
    return data
  },

  // Customer Wallet Transactions
getCustomerTransactions: async (
  page: number = 1,
  pageSize: number = 20
): Promise<CustomerWalletTransactionsResponse> => {
  const { data } = await apiClient.get<CustomerWalletTransactionsResponse>(
    `/wallet/customer/transactions?page=${page}&pageSize=${pageSize}`
  )
  return data
},

}
