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
  averageRating: number
  ratingCount: number
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

// Shop Detail Types
export interface ShopDetail {
  id: number
  name: string
  description: string
  phoneNumber: string
  provinceId: number
  provinceName: string
  districtId: number
  districtName: string
  wardCode: string
  wardName: string
  address: string
  businessType: string
  ownershipDocumentUrl: string
  shopAvatar: string
  shopBanner: string
  shopFacebook: string | null
  shopTiktok: string | null
  shopInstagram: string | null
  categoryId: string
  categoryName: string
  status: string
  rejectedReason: string | null
  ownerFullName: string
  ownerDateOfBirth: string
  ownerPersonalIdNumber: string
  ownerPersonalIdFrontUrl: string
  ownerPersonalIdBackUrl: string
  sellerId: string
  createdAt: string
  approvedAt: string
}

export interface ShopDetailProduct extends ProductItem {
  approvalStatus: string
  moderatorNote: string | null
}

export interface ShopDetailCourse {
  id: string
  title: string
  slug: string
  summary: string
  categoryId: string
  categoryName: string
  shopId: number
  shopName: string
  shopAvatar: string | null
  courseThumbnail: string
  active: number
}

export interface ShopDetailResult {
  shop: ShopDetail
  products: ShopDetailProduct[]
  courses: ShopDetailCourse[]
}

export type ShopDetailResponse = ApiResponse<ShopDetailResult>

export const productsApi = {
  getProducts: async (params?: ProductQueryParams): Promise<ProductListResponse> => {
    const { data } = await apiClient.get<ProductListResponse>("/home/products", { params })
    return data
  },

  getProductBySlug: async (slug: string): Promise<ProductDetailResponse> => {
    const { data } = await apiClient.get<ProductDetailResponse>(`/home/products/by-slug/${slug}`)
    return data
  },

  getShopDetail: async (shopId: number): Promise<ShopDetailResponse> => {
    const { data } = await apiClient.get<ShopDetailResponse>(`/home/${shopId}`)
    return data
  },
}
