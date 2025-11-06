import { CreateProductPayload, ShopProduct, shopProductsApi } from "@/api/shopProducts";
import { queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface UpdateProductParams {
  productId: string;
  payload: CreateProductPayload;
}

export const useUpdateProduct = () => {
  return useMutation<ShopProduct, any, UpdateProductParams>({
    mutationFn: async ({ productId, payload }) => {
      const response = await shopProductsApi.updateProduct(productId, payload);
      if (!response.isSuccess || !response.result) {
        throw new Error("Failed to update product");
      }
      return response.result;
    },
    onSuccess: (data) => {
      // Refetch chi tiết sản phẩm sau khi update
      queryClient.invalidateQueries({ queryKey: ["product-detail", data.id] });
      // Nếu cần refetch list sản phẩm
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
    },
  });
};
