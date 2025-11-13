import { useQuery } from "@tanstack/react-query"
import { productsApi } from "@/api/products"

export const useProductBySlug = (slug: string) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsApi.getProductBySlug(slug),
    enabled: !!slug, // chỉ fetch khi có slug
  })

  return {
    product: data?.result,
    isLoading,
    isError,
    error,
    refetch,
  }
}
