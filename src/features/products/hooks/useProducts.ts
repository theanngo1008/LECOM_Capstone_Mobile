import { useQuery } from "@tanstack/react-query"
import { productsApi, ProductQueryParams } from "../../../api/products"

export const useProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      try {
        const response = await productsApi.getProducts(params)
        console.log("Fetched products:", response)
        return response
      } catch (error: any) {
        console.error("Failed to fetch products:", error)
        throw error
      }
    },
  })
}
