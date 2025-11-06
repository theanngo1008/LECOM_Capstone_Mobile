import { useQuery } from "@tanstack/react-query"
import { shopProductsApi } from "../../../api/shopProducts"

export const useShopProducts = () => {
  return useQuery({
    queryKey: ["shop-products"],
    queryFn: async () => {
      try {
        const response = await shopProductsApi.getMyProducts()
        console.log("Fetched shop products:", response)
        return response
      } catch (error: any) {
        console.error("Failed to fetch shop products:", error)
        throw error
      }
    },
  })
}
