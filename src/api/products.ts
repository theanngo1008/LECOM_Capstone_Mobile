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
  category: string | null
  page: number
  pageSize: number
  totalPages: number
  items: ProductItem[]
}

export type ProductListResponse = ApiResponse<ProductListResult>
export type ProductDetailResponse = ApiResponse<ProductItem>

export interface ProductQueryParams {
  search?: string
  page?: number
  category?: string
  pageSize?: number
  minPrice?: number
  maxPrice?: number
}

export const productsApi = {
  getProducts: async (params?: ProductQueryParams): Promise<ProductListResponse> => {
    const { data } = await apiClient.get<ProductListResponse>("/home/products", { params })
    return data
  },

  getProductBySlug: async (slug: string): Promise<ProductDetailResponse> => {
    const { data } = await apiClient.get<ProductDetailResponse>(`/home/products/by-slug/${slug}`)
    return data
  },
}
