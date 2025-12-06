import { useMutation } from "@tanstack/react-query"
import { refundApi, CreateRefundRequest } from "@/api/refund"

export const useCreateRefund = () => {
  return useMutation({
    mutationFn: (payload: CreateRefundRequest) => refundApi.createRefund(payload),
  })
}
