import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// =======================
// TYPES
// =======================

export interface CartProductItem {
  productId: string
  productName: string
  productSlug: string
  unitPrice: number
  quantity: number
  lineTotal: number
  productImage: string
}

export interface CartShopGroup {
  shopId: number
  shopName: string
  shopAvatar: string
  items: CartProductItem[]
  subtotal: number
}

export interface CartResult {
  userId: string
  items: CartShopGroup[]
  subtotal: number
}

export type CartResponse = ApiResponse<CartResult>

export interface AddToCartPayload {
  productId: string
  quantity: number
}

export interface UpdateCartItemPayload {
  absoluteQuantity?: number // Cập nhật số lượng tuyệt đối
  quantityChange?: number   // Thay đổi số lượng (+/-)
}

// ⭐ Payload checkout theo backend yêu cầu
export interface CheckoutPayload {
  shipToName: string
  shipToPhone: string
  shipToAddress: string
  toProvinceId: number
  toProvinceName: string
  toDistrictId: number
  toDistrictName: string
  toWardCode: string
  toWardName: string
  serviceTypeId: number
  voucherCode?: string | null
  selectedProductIds: string[]
  paymentMethod: string        // "payos" | "wallet"
  note?: string
}

// ⭐ Payload checkout preview để xem trước phí ship
export interface CheckoutPreviewPayload {
  shipToName: string
  shipToPhone: string
  shipToAddress: string
  toProvinceId: number
  toProvinceName: string
  toDistrictId: number
  toDistrictName: string
  toWardCode: string
  toWardName: string
  serviceTypeId: number
  voucherCode?: string | null
  selectedProductIds: string[]
  paymentMethod: string        // "payos" | "wallet"
  note?: string
}

// ⭐ Response types cho checkout preview
export interface PreviewOrderItem {
  productId: string
  productName: string
  productImage: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface PreviewOrder {
  previewOrderId: string
  shopId: number
  shopName: string
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  totalWeight: number
  estimatedDeliveryText: string
  items: PreviewOrderItem[]
}

export interface CheckoutPreviewResult {
  orders: PreviewOrder[]
  totalAmount: number
  shippingFee: number
  discountApplied: number
  voucherCodeUsed: string | null
  serviceTypeId: number
  shipToName: string
  shipToPhone: string
  shipToAddress: string
  toProvinceId: number
  toProvinceName: string
  toDistrictId: number
  toDistrictName: string
  toWardCode: string
  toWardName: string
  note: string
}

export type CheckoutPreviewResponse = ApiResponse<CheckoutPreviewResult>

// =======================
// CART API
// =======================

export const cartApi = {
  // Lấy giỏ hàng
  getCart: async (): Promise<CartResponse> => {
    const { data } = await apiClient.get<CartResponse>("/cart/")
    return data
  },

  // Thêm sản phẩm vào giỏ
  addToCart: async (payload: AddToCartPayload): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.post<ApiResponse<null>>(
      "/cart/items",
      payload
    )
    return data
  },

  // Xóa sản phẩm khỏi giỏ
  deleteCartItem: async (productId: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/cart/items/${productId}`
    )
    return data
  },

  // Cập nhật số lượng sản phẩm
  updateCartItem: async (
    productId: string,
    payload: UpdateCartItemPayload
  ): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.patch<ApiResponse<null>>(
      `/cart/items/${productId}`,
      payload
    )
    return data
  },

  // ⭐ Checkout preview — xem trước phí ship
  checkoutPreview: async (
    payload: CheckoutPreviewPayload
  ): Promise<CheckoutPreviewResponse> => {
    const { data } = await apiClient.post<CheckoutPreviewResponse>(
      "/orders/checkout/preview",
      payload
    )
    return data
  },

  // ⭐ Checkout — chuẩn style các API khác
  checkout: async (
    payload: CheckoutPayload
  ): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      "/orders/checkout",
      payload
    )
    return data
  },
}
