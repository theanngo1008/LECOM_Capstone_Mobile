import { useMutation, useQueryClient } from "@tanstack/react-query"
import { withdrawalApi, CreateWithdrawalRequest } from "@/api/withdrawal"

export const useCreateWithdrawal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateWithdrawalRequest) =>
      withdrawalApi.createWithdrawal(payload),

    onSuccess: () => {
  
      queryClient.invalidateQueries({ queryKey: ["my-withdrawals"] })

queryClient.invalidateQueries({ queryKey: ["customer-transactions"] })
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] })
    },
  })
}
