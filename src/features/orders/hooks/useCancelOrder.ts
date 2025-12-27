import { ordersApi } from "@/api/orders";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => ordersApi.cancelOrder(orderId, reason),

    onSuccess: (data, variables) => {
      const { orderId } = variables;
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      // Invalidate order detail với orderId cụ thể
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] });
      // Invalidate tất cả order details (nếu cần)
      queryClient.invalidateQueries({ queryKey: ["order-detail"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });

  return {
    cancelOrder: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
