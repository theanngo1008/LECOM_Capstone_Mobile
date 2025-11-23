import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// ================================
// CREATE COMMUNITY POST
// ================================

export interface CreateCommunityPostPayload {
  title: string
  body: string
}

export interface CreateCommunityPost {
  id: string
  userId: string
  title: string
  body: string
  createdAt: string
  approvalStatus: string
}

export type CreateCommunityPostResponse = ApiResponse<CreateCommunityPost>

// ================================
// COMMON TYPES (User + Comment)
// ================================

export interface CommunityUser {
  id: string
  userName: string
  avatar: string | null
}

export interface CommunityComment {
  id: string
  body: string
  createdAt: string
  user: CommunityUser
}

// ================================
// LIST POST ITEM
// ================================

export interface CommunityPostItem {
  id: string
  title: string
  body: string
  createdAt: string
  user: CommunityUser
  comments: CommunityComment[]
}

export type CommunityListResponse = ApiResponse<CommunityPostItem[]>

// ================================
// DETAIL POST ITEM (same shape as list item)
// ================================

export interface CommunityPostDetailResponse
  extends ApiResponse<CommunityPostItem> {}

// ================================
// COMMENT PAYLOAD
// ================================

export interface CreateCommentPayload {
  body: string
}

export type CreateCommentResponse = ApiResponse<CommunityComment>

// ================================
// API METHODS
// ================================

export const communityApi = {
  // CREATE POST
  createPost: async (
    payload: CreateCommunityPostPayload
  ): Promise<CreateCommunityPostResponse> => {
    const { data } = await apiClient.post<CreateCommunityPostResponse>(
      "/community",
      payload
    )
    return data
  },

  // GET ALL POSTS
  getPosts: async (): Promise<CommunityListResponse> => {
    const { data } = await apiClient.get<CommunityListResponse>("/community")
    return data
  },

  // GET POST BY ID
  getPostById: async (
    postId: string
  ): Promise<CommunityPostDetailResponse> => {
    const { data } = await apiClient.get<CommunityPostDetailResponse>(
      `/community/${postId}`
    )
    return data
  },

  // CREATE COMMENT
  createComment: async (
    postId: string,
    payload: CreateCommentPayload
  ): Promise<CreateCommentResponse> => {
    const { data } = await apiClient.post<CreateCommentResponse>(
      `/community/${postId}/comment`,
      payload
    )
    return data
  }
}
