import { AddToCartPayload, cartApi } from "@/api/cart"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useAddToCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartApi.addToCart(payload),

    onSuccess: () => {
      // Refresh giỏ hàng sau khi thêm thành công
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },

    onError: (error: any) => {
      console.log("❌ Add to cart error:", error?.response?.data || error)
    },
  })
}
