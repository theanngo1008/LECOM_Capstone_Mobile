import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// ============================
// PRODUCT TYPE
// ============================
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

// ============================
// CATEGORY GROUP
// ============================
export interface CategoryGroup {
  id: string
  name: string
  slug: string
  products: ProductItem[]
}

// ============================
// COURSE TYPE
// ============================
export interface CourseItem {
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

export interface CourseCategoryGroup {
  id: string
  name: string
  slug: string
  courses: CourseItem[]
}

// ============================
// RESPONSE DATA – COURSES
// ============================
export interface BrowseCoursesResult {
  recommendedCourses: CourseItem[]
  recommendedCategories: CourseCategoryGroup[]
  newArrivalCourses: CourseItem[]
  popularCategories: {
    id: string
    name: string
    slug: string
    count: number
  }[]
}

export type BrowseCoursesResponse = ApiResponse<BrowseCoursesResult>

// ============================
// RESPONSE DATA – PRODUCTS
// ============================
export interface BrowseProductsResult {
  recommendedProducts: ProductItem[]
  recommendedCategories: CategoryGroup[]
  trendingProducts: ProductItem[]
  bestSellerProducts: ProductItem[]
  newArrivalProducts: ProductItem[]
}

export type BrowseProductsResponse = ApiResponse<BrowseProductsResult>

// ============================
// NEW TYPE: Recommended Products
// ============================
export type RecommendProductsResponse = ApiResponse<ProductItem[]>
export type RecommendCoursesResponse = ApiResponse<CourseItem[]>


// ============================
// API MODULE
// ============================
export const recombeeApi = {
  getBrowseProducts: async (): Promise<BrowseProductsResponse> => {
    const { data } = await apiClient.get<BrowseProductsResponse>(
      "/recombee/browse/products"
    )
    return data
  },

  getBrowseCourses: async (): Promise<BrowseCoursesResponse> => {
    const { data } = await apiClient.get<BrowseCoursesResponse>(
      "/recombee/browse/courses"
    )
    return data
  },


  getRecommendedProducts: async (
    slug: string
  ): Promise<RecommendProductsResponse> => {
    const { data } = await apiClient.get<RecommendProductsResponse>(
      `/recombee/product/${slug}/recommend`
    )
    return data
  },

 
  getRecommendedCourses: async (
    slug: string
  ): Promise<RecommendCoursesResponse> => {
    const { data } = await apiClient.get<RecommendCoursesResponse>(
      `/recombee/course/${slug}/recommend`
    )
    return data
  }
}
