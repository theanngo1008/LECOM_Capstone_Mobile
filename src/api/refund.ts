import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// ============================
// REQUEST BODY
// ============================
export interface CreateRefundRequest {
  orderId: string
  reasonType: "ProductIssue" 
  reasonDescription: string
  type: "Full" 
  refundAmount: number
  attachmentUrls: string | null
}

// ============================
// RESPONSE (from backend)
// ============================
export interface RefundResponseData {
  id: string
  orderId: string
  status: string
  type: string
  refundAmount: number
  createdAt: string
}

export type RefundResponse = ApiResponse<RefundResponseData>

// ============================
// API MODULE
// ============================
export const refundApi = {
  // POST /Refund
  createRefund: async (payload: CreateRefundRequest): Promise<RefundResponse> => {
    const { data } = await apiClient.post<RefundResponse>("/refund", payload)
    return data
  }
}
