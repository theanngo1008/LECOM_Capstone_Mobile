import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// ==============================================
// ENUMS
// ==============================================
export type OrderStatus =
  | "Pending"
  | "Paid"
  | "Processing"
  | "Shipping"
  | "Completed"
  | "Cancelled"


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

  status: OrderStatus
  paymentStatus: string

  balanceReleased: boolean

  createdAt: string
  completedAt: string | null

  details: ShopOrderDetailItem[]
}

export type ShopOrderListResponse = ApiResponse<ShopOrderItem[]>
export type ShopOrderDetailResponse = ApiResponse<ShopOrderItem>

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

  // GET /orders/{id}/shop-detail
  getShopOrderDetail: async (
    orderId: string
  ): Promise<ShopOrderDetailResponse> => {
    const { data } = await apiClient.get<ShopOrderDetailResponse>(
      `/orders/${orderId}/shop-detail`
    )
    return data
  },

  // PUT /orders/{id}/status
  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus
  ): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.put<ApiResponse<any>>(
      `/orders/${orderId}/status`,
      { status }
    )
    return data
  },
}
