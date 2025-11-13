import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

export interface CartItem {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  lineTotal: number
  productImage: string
}

export interface CartResult {
  userId: string
  items: CartItem[]
  subtotal: number
}

export type CartResponse = ApiResponse<CartResult>

export interface AddToCartPayload {
  productId: string
  quantity: number
}

export const cartApi = {
  // Lấy giỏ hàng
  getCart: async (): Promise<CartResponse> => {
    const { data } = await apiClient.get<CartResponse>("/cart/")
    return data
  },

  //  Thêm sản phẩm vào giỏ
  addToCart: async (payload: AddToCartPayload): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.post<ApiResponse<null>>("/cart/items", payload)
    return data
  },

  //  Xóa sản phẩm khỏi giỏ
  deleteCartItem: async (productId: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/cart/items/${productId}`)
    return data
  },
}
