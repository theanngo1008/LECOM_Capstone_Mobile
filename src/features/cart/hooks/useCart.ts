import { useQuery } from "@tanstack/react-query"
import { cartApi } from "@/api/cart"

export const useCart = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.getCart(),
  })

  return {
    cart: data?.result,
    items: data?.result?.items || [],
    subtotal: data?.result?.subtotal || 0,
    isLoading,
    isError,
    refetch,
  }
}
