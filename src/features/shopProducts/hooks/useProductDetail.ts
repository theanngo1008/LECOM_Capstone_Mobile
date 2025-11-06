import { useQuery } from "@tanstack/react-query";
import { shopProductsApi, ShopProduct } from "@/api/shopProducts";


export const useProductDetail = (productId: string) => {
  return useQuery<ShopProduct>({
    queryKey: ["product-detail", productId],
    queryFn: async () => {
      const response = await shopProductsApi.getProductById(productId);
      if (!response.isSuccess || !response.result) {
        throw new Error("Failed to fetch product detail");
      }
      return response.result;
    },
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
