import { apiClient } from "./client"
import { ApiResponse } from "@/types/common"

export interface CreateFeedbackPayload {
  orderId: string
  productId: string
  rating: number
  content: string
  imageUrls: string[]
}

export interface FeedbackResponse {
  id: string
  orderId: string
  productId: string
  rating: number
  content: string
  imageUrls: string[]
  createdAt: string
}

export type CreateFeedbackResponse = ApiResponse<FeedbackResponse>

export const feedbackApi = {
  createFeedback: async (
    payload: CreateFeedbackPayload
  ): Promise<CreateFeedbackResponse> => {
    const { data } = await apiClient.post<CreateFeedbackResponse>(
      "/feedback",
      payload
    )
    return data
  },
}
