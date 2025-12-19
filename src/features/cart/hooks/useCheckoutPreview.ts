import { cartApi, CheckoutPreviewPayload, CheckoutPreviewResponse } from "@/api/cart"
import { useMutation } from "@tanstack/react-query"

export const useCheckoutPreview = () => {
  const {
    mutate: previewCheckout,
    data,
    error,
    isPending,
    isSuccess,
    reset,
  } = useMutation<CheckoutPreviewResponse, Error, CheckoutPreviewPayload>({
    mutationFn: async (payload) => {
      return await cartApi.checkoutPreview(payload)
    },
  })

  return {
    previewCheckout,
    data,
    previewData: data?.result || null,
    orders: data?.result?.orders || [],
    totalAmount: data?.result?.totalAmount || 0,
    shippingFee: data?.result?.shippingFee || 0,
    discountApplied: data?.result?.discountApplied || 0,
    isLoading: isPending,
    isSuccess,
    error,
    reset,
  }
}

