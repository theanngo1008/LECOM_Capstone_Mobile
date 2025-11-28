import { useQuery } from "@tanstack/react-query"
import { walletApi } from "@/api/wallet"

export const useShopWalletTransactions = (
  page: number = 1,
  pageSize: number = 20
) => {
  return useQuery({
    queryKey: ["shop-wallet-transactions", page, pageSize],
    queryFn: () => walletApi.getShopTransactions(page, pageSize),

    // React Query v5 replacement for keepPreviousData
    placeholderData: (prev) => prev,
  })
}
