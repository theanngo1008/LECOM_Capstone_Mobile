import { cartApi, CheckoutPayload } from "@/api/cart"
import { ApiResponse } from "@/types/common"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCheckout = () => {
  const queryClient = useQueryClient()

  const {
    mutate: checkout,
    data,
    error,
    isPending,
    isSuccess,
    reset,
  } = useMutation<ApiResponse<any>, Error, CheckoutPayload>({
    mutationFn: async (payload) => {
      return await cartApi.checkout(payload)
    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["cart"] })

     
      queryClient.invalidateQueries({ queryKey: ["vouchers", "my"] })

    
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] })
    },
  })

  return {
    checkout,
    data,
    paymentUrl: data?.result?.paymentUrl || null,
    orders: data?.result?.orders || null,
    isLoading: isPending,
    isSuccess,
    error,
    reset,
  }
}
