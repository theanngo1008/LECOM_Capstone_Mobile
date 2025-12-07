import { ApiResponse } from "../types/common";
import { apiClient } from "./client";

// ============================
// REQUEST BODY (Customer tạo Refund)
// ============================
export interface CreateRefundRequest {
  orderId: string;
  reasonType: "ProductIssue";
  reasonDescription: string;
  type: "Full";
  refundAmount: number;
  attachmentUrls: string | null;
}

// ============================
// RESPONSE cho createRefund
// ============================
export interface RefundResponseData {
  id: string;
  orderId: string;
  status: string;
  type: string;
  refundAmount: number;
  createdAt: string;
}

export type RefundResponse = ApiResponse<RefundResponseData>;

// ============================
// Refund item cho Seller Dashboard
// ============================
export interface RefundItem {
  id: string;
  orderId: string;
  orderCode: string;

  requestedBy: string;
  requestedByName: string;
  requestedAt: string;

  reasonType: string;
  reasonDescription: string;

  type: string;
  refundAmount: number;
  attachmentUrls: string | null;

  status: string;

  shopResponseBy: string | null;
  shopResponseByName: string | null;
  shopRespondedAt: string | null;
  shopRejectReason: string | null;

  processedBy: string | null;
  processedByName: string | null;
  processedAt: string | null;
  processNote: string | null;
}

export type RefundListResponse = ApiResponse<RefundItem[]>;

// ============================
// Admin Decision Request
// ============================
export interface RefundDecisionRequest {
  approve: boolean;
  rejectReason?: string | null;
}

// ============================
// API MODULE
// ============================
export const refundApi = {
  createRefund: async (
    payload: CreateRefundRequest
  ): Promise<RefundResponse> => {
    const { data } = await apiClient.post<RefundResponse>("/refund", payload);
    return data;
  },

  getSellerRefunds: async (): Promise<RefundListResponse> => {
    const { data } = await apiClient.get<RefundListResponse>("/refund/seller");
    return data;
  },

  // ============================
  // POST /refund/seller/{refundId}/decision
  // ============================
  decideRefund: async (
    refundId: string,
    payload: RefundDecisionRequest
  ): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      `/refund/seller/${refundId}/decision`,
      payload
    );
    return data;
  }
};
