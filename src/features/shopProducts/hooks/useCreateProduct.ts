import { useMutation, useQueryClient } from "@tanstack/react-query"
import { shopProductsApi, CreateProductPayload, ShopProduct } from "../../../api/shopProducts"

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateProductPayload): Promise<ShopProduct> => {
      try {
        const response = await shopProductsApi.createProduct(payload)
        return response.result
      } catch (error: any) {
        console.error("Failed to create product:", error)
        throw error
      }
    },
    onSuccess: (newProduct) => {
      console.log("Product created successfully:", newProduct)
      // Tự động refetch danh sách sản phẩm sau khi tạo
      queryClient.invalidateQueries({ queryKey: ["shop-products"] })
    },
    onError: (error: any) => {
      console.error("Error creating product:", error)
    },
  })
}
