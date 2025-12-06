import { useQuery } from "@tanstack/react-query"
import { sellerDashboardApi, SellerDashboardQuery } from "@/api/dashboard"

export const useSellerDashboard = (params: SellerDashboardQuery) => {
  return useQuery({
    queryKey: ["seller-dashboard", params],
    queryFn: () => sellerDashboardApi.getDashboard(params),
    enabled: !!params.view
  })
}
