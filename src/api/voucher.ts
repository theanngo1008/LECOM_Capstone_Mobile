import { ApiResponse } from "../types/common";
import { apiClient } from "./client";

export interface Voucher {
  code: string;
  discountType: "FixedAmount" | "Percentage";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  isUsed: boolean;
  isExpired: boolean;
  assignedAt: string;
  usedAt: string | null;
}

export type VoucherResponse = ApiResponse<Voucher[]>;

// GET /vouchers/my → lấy voucher người dùng
export const getMyVouchers = async (): Promise<Voucher[]> => {
  const res = await apiClient.get<VoucherResponse>("/vouchers/my");
  return res.data.result;
};
