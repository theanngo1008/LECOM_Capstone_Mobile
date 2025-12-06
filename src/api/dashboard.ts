import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// ======================================================
// TYPES
// ======================================================

// ----- VIEW TYPE -----
export type DashboardView =
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "custom"

// ----- QUERY PARAMS -----
export interface SellerDashboardQuery {
  view: DashboardView
  date?: string
  from?: string
  to?: string
}

// ----- RANGE INFO -----
export interface DateRangeInfo {
  view: DashboardView
  baseDate: string
  from: string
  to: string
}

// ----- OVERVIEW -----
export interface OverviewStats {
  from: string
  to: string
  totalOrders: number
  completedOrders: number
  cancelledOrders: number
  pendingOrders: number
  totalRevenue: number
  totalRefundAmount: number
  netRevenue: number
  averageOrderValue: number
  uniqueCustomers: number
}

// ----- CHART DATA (UPDATED) -----
export interface RevenueChartPoint {
  date: string
  revenue: number
}

// ----- TOP PRODUCTS (UPDATED) -----
export interface TopProductItem {
  productId: string
  productName: string
  thumbnailUrl: string | null
  totalQuantity: number
  totalRevenue: number
  averageRating: number
  feedbackCount: number
}

// ----- RECENT ORDERS (UPDATED) -----
export interface RecentOrderItem {
  orderId: string
  orderCode: string
  createdAt: string
  status: string
  paymentStatus: string
  total: number
  customerName: string
}

// ----- REFUND SUMMARY -----
export interface RefundSummary {
  totalRequests: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  totalRefundAmount: number
}

// ----- RATING SUMMARY -----
export interface RatingSummary {
  averageRating: number
  totalFeedbacks: number
  rating1Count: number
  rating2Count: number
  rating3Count: number
  rating4Count: number
  rating5Count: number
  positiveRate: number
}

// ----- WALLET SUMMARY (UPDATED) -----
export interface WalletSummary {
  availableBalance: number
  pendingBalance: number
  totalEarned: number
  pendingWithdrawalAmount: number
  approvedWithdrawalAmount: number
  lastUpdatedAt: string
}

// ----- FINAL DASHBOARD RESULT -----
export interface SellerDashboardResult {
  shopId: number
  shopName: string
  range: DateRangeInfo
  overview: OverviewStats
  revenueChart: RevenueChartPoint[]
  topProducts: TopProductItem[]
  recentOrders: RecentOrderItem[]
  refundSummary: RefundSummary
  ratingSummary: RatingSummary
  walletSummary: WalletSummary
}

export type SellerDashboardResponse = ApiResponse<SellerDashboardResult>

// ======================================================
// API MODULE
// ======================================================

const buildQuery = (params: SellerDashboardQuery) => {
  const query = new URLSearchParams()
  query.append("view", params.view)
  if (params.date) query.append("date", params.date)
  if (params.from) query.append("from", params.from)
  if (params.to) query.append("to", params.to)
  return query.toString()
}

export const sellerDashboardApi = {
  getDashboard: async (
    params: SellerDashboardQuery
  ): Promise<SellerDashboardResponse> => {
    const qs = buildQuery(params)

    const { data } = await apiClient.get<SellerDashboardResponse>(
      `/seller/dashboard?${qs}`
    )

    return data
  }
}
