import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ordersApi } from "@/api/orders"

export const useConfirmOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.confirmOrder(orderId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] })
    },
  })
}
