import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refundApi, RefundDecisionRequest } from "@/api/refund";

export const useSellerRefundDecision = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      refundId,
      payload,
    }: {
      refundId: string;
      payload: RefundDecisionRequest;
    }) => refundApi.decideRefund(refundId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-refunds"] });
    },
  });

  return {
    decideRefund: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
