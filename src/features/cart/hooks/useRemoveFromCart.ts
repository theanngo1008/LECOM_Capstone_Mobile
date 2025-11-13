import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cartApi } from "@/api/cart"

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string) => cartApi.deleteCartItem(productId),

    onSuccess: () => {
      //  Làm mới dữ liệu giỏ hàng sau khi xoá
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },

    onError: (error: any) => {
      console.log(" Xóa sản phẩm khỏi giỏ hàng thất bại:", error.response?.data || error)
    },
  })
}
