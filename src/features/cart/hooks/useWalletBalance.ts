import { walletApi } from "@/api/wallet"
import { useQuery } from "@tanstack/react-query"

export function useWalletBalance() {
  return useQuery({
    queryKey: ["walletBalance"],
    queryFn: walletApi.getBalance,
  })
}
