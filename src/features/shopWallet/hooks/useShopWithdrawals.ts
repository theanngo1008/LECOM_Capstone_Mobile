import { withdrawalApi } from "@/api/withdrawal"
import { useQuery } from "@tanstack/react-query"

export const useShopWithdrawals = (page: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: ["shop-withdrawals", page, pageSize],
    queryFn: () => withdrawalApi.getMyShopWithdrawals(page, pageSize),
  })
}
