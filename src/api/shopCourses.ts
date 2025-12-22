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
  active: number
}
export interface LinkedProduct {
  id: string
  name: string
  price: number
  thumbnailUrl: string
  shopName: string
}

export interface QuizAnswer {
  content: string
  isCorrect: boolean
}

export interface QuizQuestion {
  content: string
  answers: QuizAnswer[]
}

export interface Quiz {
  questions: QuizQuestion[]
}

export interface CourseLesson {
  id: string
  courseSectionId: string | null
  title: string
  type: string
  durationSeconds: number | null
  contentUrl: string | null
  orderIndex: number
  linkedProducts: LinkedProduct[]
  approvalStatus: "Approved" | "Pending" | "Rejected"
  moderatorNote: string | null
  quiz: Quiz | null
}


export interface CourseSection {
  id: string
  title: string
  orderIndex: number
  lessons: CourseLesson[]
  approvalStatus: "Approved" | "Pending" | "Rejected"
  moderatorNote: string | null
}

export interface CreateCoursePayload {
  title: string
  slug: string
  summary: string
  categoryId: string
  shopId: number
  courseThumbnail: string
}

export interface CreateSectionPayload {
  courseId: string
  title: string
  orderIndex: number
}

export interface CreateLessonPayload {
  courseSectionId: string
  title: string
  durationSeconds: number
  contentUrl: string
  orderIndex: number
  type?: string
  quiz?: Quiz | null
}

export interface UpdateCoursePayload {
  title: string
  summary: string
  categoryId: string
  courseThumbnail: string
  active: number
}

// 🔗 Payload để liên kết Product ↔ Lesson
export interface LinkProductToLessonPayload {
  lessonId: string
  productId: string
}

export type LinkProductToLessonResponse = ApiResponse<null>

export type ShopCoursesResponse = ApiResponse<ShopCourse[]>
export type CreateCourseResponse = ApiResponse<ShopCourse>
export type CourseDetailResponse = ApiResponse<ShopCourse>
export type CourseSectionsResponse = ApiResponse<CourseSection[]>
export type CreateSectionResponse = ApiResponse<CourseSection>
export type CreateLessonResponse = ApiResponse<CourseLesson>

export const shopCourseApi = {
  getMyCourses: async (): Promise<ShopCoursesResponse> => {
    const { data } = await apiClient.get<ShopCoursesResponse>("/seller/courses/my")
    return data
  },

  createCourse: async (payload: CreateCoursePayload): Promise<CreateCourseResponse> => {
    const { data } = await apiClient.post<CreateCourseResponse>("/seller/courses", payload)
    return data
  },

  getCourseById: async (courseId: string): Promise<CourseDetailResponse> => {
    const { data } = await apiClient.get<CourseDetailResponse>(`/seller/courses/${courseId}`)
    return data
  },

  updateCourse: async (
    courseId: string,
    payload: UpdateCoursePayload
  ): Promise<CreateCourseResponse> => {
    const { data } = await apiClient.put<CreateCourseResponse>(
      `/seller/courses/${courseId}`,
      payload
    )
    return data
  },

  deleteCourse: async (courseId: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/seller/courses/${courseId}`)
    return data
  },

  getCourseSections: async (courseId: string): Promise<CourseSectionsResponse> => {
    const { data } = await apiClient.get<CourseSectionsResponse>(
      `/seller/courses/${courseId}/sections`
    )
    return data
  },

  createCourseSection: async (payload: CreateSectionPayload): Promise<CreateSectionResponse> => {
    const { data } = await apiClient.post<CreateSectionResponse>(
      "/seller/courses/sections",
      payload
    )
    return data
  },

  createLesson: async (payload: CreateLessonPayload): Promise<CreateLessonResponse> => {
    const { data } = await apiClient.post<CreateLessonResponse>("/seller/courses/lessons", {
      ...payload,
      type: payload.type || "Video",
    })
    return data
  },

  deleteLesson: async (lessonId: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/seller/courses/lessons/${lessonId}`
    )
    return data
  },

  deleteSection: async (sectionId: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/seller/courses/sections/${sectionId}`
    )
    return data
  },

  // 🔗 Liên kết sản phẩm vào bài học
  linkProductToLesson: async (
    payload: LinkProductToLessonPayload
  ): Promise<LinkProductToLessonResponse> => {
    const { data } = await apiClient.post<LinkProductToLessonResponse>(
      "/seller/courses/lessons/products",
      payload
    )
    return data
  },
}
