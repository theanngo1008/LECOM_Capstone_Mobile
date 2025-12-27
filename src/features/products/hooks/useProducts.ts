import { useQuery } from "@tanstack/react-query";
import { ProductQueryParams, productsApi } from "../../../api/products";

export const useProducts = (params?: ProductQueryParams) => {
  const queryKey = [
    "products",
    params?.search || "",
    params?.category || "",
    params?.page || 1,
    params?.pageSize || 10,
  ];

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        console.log("📤 Fetching products with params:", params)
        const response = await productsApi.getProducts(params)
        console.log("📥 Fetched products response:", response)
        return response
      } catch (error: any) {
        console.error("❌ Failed to fetch products:", error)
        throw error
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
}
