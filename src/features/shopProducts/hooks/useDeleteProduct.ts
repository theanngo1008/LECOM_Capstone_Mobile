import { shopProductsApi } from "@/api/shopProducts"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert } from "react-native"

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string) => {
      return await shopProductsApi.deleteProduct(productId)
    },
    onSuccess: () => {
      Alert.alert("Success", "Product has been deleted successfully.")
      queryClient.invalidateQueries({ queryKey: ["shop-products"] })
    },
    onError: (error: any) => {
      console.error("Delete Product Error:", error)
      Alert.alert("Error", "Failed to delete product. Please try again.")
    },
  })
}
