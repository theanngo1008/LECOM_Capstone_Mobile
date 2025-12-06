import { useQuery } from "@tanstack/react-query"
import { withdrawalApi } from "@/api/withdrawal"

export const useMyWithdrawals = (page: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: ["my-withdrawals", page, pageSize],
    queryFn: () => withdrawalApi.getMyWithdrawals(page, pageSize),
    placeholderData: (prev) => prev,
  })
}
