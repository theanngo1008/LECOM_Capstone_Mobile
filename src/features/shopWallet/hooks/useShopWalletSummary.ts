import { useQuery } from "@tanstack/react-query"
import { walletApi } from "@/api/wallet"

export const useShopWalletSummary = () => {
  return useQuery({
    queryKey: ["shop-wallet-summary"],
    queryFn: walletApi.getShopSummary,
  })
}
