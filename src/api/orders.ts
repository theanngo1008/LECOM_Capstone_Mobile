import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

export interface OrderDetailItem {
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

export interface OrderItem {
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

  details: OrderDetailItem[]
}

export type OrderListResponse = ApiResponse<OrderItem[]>
export type OrderResponse = ApiResponse<OrderItem>

export const ordersApi = {
  // ============================
  // GET /orders/my
  // ============================
  getMyOrders: async (): Promise<OrderListResponse> => {
    const { data } = await apiClient.get<OrderListResponse>("/orders/my")
    return data
  },

  // ============================
  // GET /orders/{id}
  // ============================
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    const { data } = await apiClient.get<OrderResponse>(`/orders/${orderId}`)
    return data
  },

  // ============================
  // POST /orders/{orderId}/confirm
  // ============================
  confirmOrder: async (orderId: string): Promise<OrderResponse> => {
    const { data } = await apiClient.post<OrderResponse>(
      `/orders/${orderId}/confirm`
    )
    return data
  }
}

