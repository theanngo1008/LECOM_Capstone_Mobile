import { ordersApi } from "@/api/orders"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useConfirmOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.confirmOrder(orderId),

    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] })
      // Invalidate order detail với orderId cụ thể
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      // Invalidate tất cả order details (nếu cần)
      queryClient.invalidateQueries({ queryKey: ["order-detail"] })
    },
  })
}
