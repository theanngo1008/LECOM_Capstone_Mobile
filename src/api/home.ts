import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

export interface CourseCategory {
  id: string
  name: string
  description: string | null
}

export interface ProductCategory {
  id: string
  name: string
  description: string | null
}

export interface PopularCourse {
  id: string
  title: string
  slug: string
  summary: string
  categoryId: string
  categoryName: string
  shopId: number
  shopName: string
  shopAvatar: string
  courseThumbnail: string
  active: number
}

export interface ProductImage {
  url: string
  orderIndex: number
  isPrimary: boolean
}

export interface BestSellerProduct {
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

export interface LandingPageData {
  topCourseCategories: CourseCategory[]
  topProductCategories: ProductCategory[]
  popularCourses: PopularCourse[]
  bestSellerProducts: BestSellerProduct[]
}

export type LandingPageResponse = ApiResponse<LandingPageData>

export const homeApi = {
  getLandingPage: async (): Promise<LandingPageResponse> => {
    const { data } = await apiClient.get<LandingPageResponse>("/landing-page")
    return data
  },
}
