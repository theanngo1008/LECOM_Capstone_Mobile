import { useQuery } from "@tanstack/react-query"
import { productsApi } from "@/api/products"

export const useShopDetail = (shopId: number) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["shop-detail", shopId],
    queryFn: () => productsApi.getShopDetail(shopId),
    enabled: !!shopId && shopId > 0,
  })

  return {
    shopDetail: data?.result,
    isLoading,
    isError,
    error,
    refetch,
  }
}

