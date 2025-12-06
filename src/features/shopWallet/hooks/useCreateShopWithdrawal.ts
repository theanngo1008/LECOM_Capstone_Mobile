import { CreateWithdrawalRequest, withdrawalApi } from "@/api/withdrawal"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateShopWithdrawal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateWithdrawalRequest) =>
      withdrawalApi.createShopWithdrawal(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-withdrawals"] })
      queryClient.invalidateQueries({ queryKey: ["shop-wallet-summary"] })
      queryClient.invalidateQueries({ queryKey: ["shop-wallet-transactions"] })
    }
  })
}
