import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

export interface ShopCourse {
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
  active: number // 1 = active, 0 = inactive
}

export interface CreateCoursePayload {
  title: string
  slug: string
  summary: string
  categoryId: string
  shopId: number
  courseThumbnail: string
}

export type ShopCoursesResponse = ApiResponse<ShopCourse[]>
export type CreateCourseResponse = ApiResponse<ShopCourse>

export const shopCourseApi = {
  // Lấy danh sách khóa học của shop
  getMyCourses: async (): Promise<ShopCoursesResponse> => {
    const { data } = await apiClient.get<ShopCoursesResponse>("/seller/courses/my")
    return data
  },

  // Tạo khóa học mới
  createCourse: async (payload: CreateCoursePayload): Promise<CreateCourseResponse> => {
    const { data } = await apiClient.post<CreateCourseResponse>(
      "/seller/courses",
      payload
    )
    return data
  },
}
