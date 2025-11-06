import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert } from "react-native"
import { shopProductsApi } from "../../../api/shopProducts"

export function useUpdateProductStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      productId,
      status,
    }: {
      productId: string
      status: "Draft" | "Published" | "OutOfStock" | "Archived"
    }) => {
      return await shopProductsApi.updateProductStatus(productId, status)
    },

    onSuccess: (data) => {
      // Cập nhật lại cache danh sách sản phẩm
      queryClient.invalidateQueries({ queryKey: ["shop-products"] })
      Alert.alert("Thành công", `Trạng thái sản phẩm đã được cập nhật thành ${data.result.status}`)
    },

    onError: (error: any) => {
      console.error("❌ Update Product Status Error:", error)
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái sản phẩm")
    },
  })
}
