import { useQuery } from "@tanstack/react-query"
import { recombeeApi } from "@/api/recombee"

export const useRecommendedProducts = (slug: string) => {
  return useQuery({
    queryKey: ["recommended-products", slug],
    queryFn: () => recombeeApi.getRecommendedProducts(slug),
    enabled: !!slug, // chỉ chạy khi có slug
  })
}
