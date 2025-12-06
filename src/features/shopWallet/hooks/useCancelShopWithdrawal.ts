import { withdrawalApi } from "@/api/withdrawal"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCancelShopWithdrawal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (withdrawalId: string) =>
      withdrawalApi.cancelShopWithdrawal(withdrawalId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-withdrawals"] })
      queryClient.invalidateQueries({ queryKey: ["shop-wallet-summary"] })
      queryClient.invalidateQueries({ queryKey: ["shop-wallet-transactions"] })
    }
  })
}
