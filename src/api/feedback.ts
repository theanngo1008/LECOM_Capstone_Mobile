import { ApiResponse } from "@/types/common"
import { apiClient } from "./client"

// =========================
// PAYLOADS
// =========================

export interface CreateFeedbackPayload {
  orderId: string
  productId: string
  rating: number
  content: string
  images?: any[] // RN: { uri, name, type }
}
export interface ReplyFeedbackPayload {
  replyContent: string;
}

export type ReplyFeedbackResponse = ApiResponse<FeedbackItem>;


export interface UpdateFeedbackPayload {
  rating?: number
  content?: string
  images?: any[]
}

// =========================
// RESPONSE TYPES
// =========================

export interface FeedbackReply {
  content: string
  createdAt: string
}

export interface FeedbackItem {
  id: string
  userId: string
  userName: string
  userAvatar: string | null

  productId: string
  shopId: number

  rating: number
  content: string
  images: string[]
  createdAt: string

  reply?: FeedbackReply | null
}

export interface PaginationInfo {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface FeedbackListData {
  items: FeedbackItem[]
  pagination: PaginationInfo
}

export type GetFeedbackListResponse = ApiResponse<FeedbackListData>
export type CreateFeedbackResponse = ApiResponse<FeedbackItem>
export type UpdateFeedbackResponse = ApiResponse<FeedbackItem>
export type DeleteFeedbackResponse = ApiResponse<null>

// =========================
// API MODULE
// =========================

export const feedbackApi = {
  // POST /feedback (multipart)
  createFeedback: async (
    payload: CreateFeedbackPayload
  ): Promise<CreateFeedbackResponse> => {
    const formData = new FormData()

    formData.append("OrderId", payload.orderId)
    formData.append("ProductId", payload.productId)
    formData.append("Rating", String(payload.rating))
    formData.append("Content", payload.content)

    if (payload.images?.length) {
      payload.images.forEach((img) => {
        formData.append("Images", img)
      })
    }

    const { data } = await apiClient.post<CreateFeedbackResponse>(
      "/feedback",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )

    return data
  },

  // GET /feedback/product/{productId}
  getFeedbackByProduct: async (
    productId: string,
    pageNumber = 1,
    pageSize = 10,
    rating?: number
  ): Promise<GetFeedbackListResponse> => {
    const { data } = await apiClient.get<GetFeedbackListResponse>(
      `/feedback/product/${productId}`,
      {
        params: { pageNumber, pageSize, rating }
      }
    )

    return data
  },

  // PUT /feedback/{feedbackId}
  updateFeedback: async (
    feedbackId: string,
    payload: UpdateFeedbackPayload
  ): Promise<UpdateFeedbackResponse> => {
    const formData = new FormData()

    if (payload.rating !== undefined) {
      formData.append("Rating", String(payload.rating))
    }

    if (payload.content !== undefined) {
      formData.append("Content", payload.content)
    }

    if (payload.images?.length) {
      payload.images.forEach((img) => {
        formData.append("Images", img)
      })
    }

    const { data } = await apiClient.put<UpdateFeedbackResponse>(
      `/feedback/${feedbackId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )

    return data
  },

  // DELETE /feedback/{feedbackId}
  deleteFeedback: async (
    feedbackId: string
  ): Promise<DeleteFeedbackResponse> => {
    const { data } = await apiClient.delete<DeleteFeedbackResponse>(
      `/feedback/${feedbackId}`
    )

    return data
  },

   getShopFeedback: async (
  pageNumber = 1,
  pageSize = 10,
  rating?: number
): Promise<GetFeedbackListResponse> => {
  const { data } = await apiClient.get<GetFeedbackListResponse>(
    `/Feedback/shop/me`,
    { 
      params: { pageNumber, pageSize, rating }
    }
  );

  return data;
},
// POST /feedback/{feedbackId}/reply
replyFeedback: async (
  feedbackId: string,
  payload: ReplyFeedbackPayload
): Promise<ReplyFeedbackResponse> => {
  const { data } = await apiClient.post<ReplyFeedbackResponse>(
    `/Feedback/${feedbackId}/reply`,
    payload
  );

  return data;
},
// PUT /feedback/{feedbackId}/reply
updateReply: async (
  feedbackId: string,
  payload: ReplyFeedbackPayload
): Promise<ReplyFeedbackResponse> => {
  const { data } = await apiClient.put<ReplyFeedbackResponse>(
    `/Feedback/${feedbackId}/reply`,
    payload
  );

  return data;
},

}
