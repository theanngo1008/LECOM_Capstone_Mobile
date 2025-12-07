import { ordersApi } from "@/api/orders"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useConfirmOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.confirmOrder(orderId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] })
      queryClient.invalidateQueries({ queryKey: ["order-details"] })
    },
  })
}
