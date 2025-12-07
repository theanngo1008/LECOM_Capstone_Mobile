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

    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
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
