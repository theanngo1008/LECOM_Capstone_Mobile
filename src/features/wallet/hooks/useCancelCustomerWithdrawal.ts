import { withdrawalApi } from "@/api/withdrawal"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCancelCustomerWithdrawal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (withdrawalId: string) =>
      withdrawalApi.cancelCustomerWithdrawal(withdrawalId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-withdrawals"] })
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] })
      queryClient.invalidateQueries({ queryKey: ["customer-transactions"] })
    }
  })
}
