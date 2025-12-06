import { walletApi } from "@/api/wallet"
import { useQuery } from "@tanstack/react-query"

export const useCustomerTransactions = (page: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: ["customer-transactions", page, pageSize],
    queryFn: () => walletApi.getCustomerTransactions(page, pageSize),

    // React Query v5 replacement for keepPreviousData
    placeholderData: (prev) => prev,
  })
}
