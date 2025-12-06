import { useQuery } from "@tanstack/react-query"
import { recombeeApi } from "@/api/recombee"

export const useBrowseProducts = () => {
  return useQuery({
    queryKey: ["browse-products"],
    queryFn: () => recombeeApi.getBrowseProducts()
  })
}
