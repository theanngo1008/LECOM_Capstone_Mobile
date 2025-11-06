import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

export interface ProductImage {
  url: string
  orderIndex: number
  isPrimary: boolean
}

export interface ProductItem {
  id: string
  name: string
  slug: string
  description: string
  categoryId: string
  categoryName: string
  price: number
  stock: number
  status: string
  lastUpdatedAt: string
  images: ProductImage[]
  thumbnailUrl: string
  shopId: number
  shopName: string
  shopAvatar: string
  shopDescription: string
}

export interface ProductListResult {
  totalItems: number
  page: number
  pageSize: number
  totalPages: number
  items: ProductItem[]
}

export type ProductListResponse = ApiResponse<ProductListResult>

export interface ProductQueryParams {
  search?: string
  page?: number
  pageSize?: number
  minPrice?: number
  maxPrice?: number
}

export const productsApi = {
  getProducts: async (params?: ProductQueryParams): Promise<ProductListResponse> => {
    const { data } = await apiClient.get<ProductListResponse>("/home/products", {
      params,
    })
    return data
  },
}
