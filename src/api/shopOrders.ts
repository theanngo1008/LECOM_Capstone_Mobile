import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// ==============================================
// TYPES
// ==============================================

export interface ShopOrderDetailItem {
  id: string | null
  productId: string
  productName: string
  productImage: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
  productSku: string | null
  productCategory: string | null
}

export interface ShopOrderItem {
  id: string
  orderCode: string
  userId: string

  shopId: number
  shopName: string

  customerName: string | null

  shipToName: string
  shipToPhone: string
  shipToAddress: string

  subtotal: number
  shippingFee: number
  discount: number
  total: number

  status: string
  paymentStatus: string

  balanceReleased: boolean

  createdAt: string
  completedAt: string | null

  details: ShopOrderDetailItem[]
}

export type ShopOrderListResponse = ApiResponse<ShopOrderItem[]>

// ==============================================
// API MODULE
// ==============================================

export const shopOrdersApi = {
  // GET /orders/shop/my
  getMyShopOrders: async (): Promise<ShopOrderListResponse> => {
    const { data } = await apiClient.get<ShopOrderListResponse>(
      "/orders/shop/my"
    )
    return data
  },

  // ==================================================
  // PUT /orders/{id}/status
  // ==================================================
  updateOrderStatus: async (
    orderId: string,
    status: string
  ): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.put<ApiResponse<any>>(
      `/orders/${orderId}/status`,
      { status }
    )
    return data
  },
}
