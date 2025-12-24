import { gamificationApi, RedeemRequest, RedeemResponse } from "@/api/gamification"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert } from "react-native"

export function useRedeemReward(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient()
  
  const mutation = useMutation<RedeemResponse, Error, RedeemRequest>({
    mutationFn: async (payload) => {
      const res = await gamificationApi.redeemReward(payload)
      if (!res.isSuccess) {
        const error = new Error(res.errorMessages?.[0] || "Đổi phần thưởng thất bại") as any
        error.errorMessages = res.errorMessages
        throw error
      }
      return res
    },

    onSuccess: () => {
      Alert.alert("Thành công!", "Bạn đã đổi phần thưởng thành công 🎉")
      
      // Invalidate vouchers query để refresh danh sách voucher
      queryClient.invalidateQueries({ queryKey: ["vouchers", "my"] })
      
      // Gọi callback để refresh list rewards hoặc profile nếu cần
      if (onSuccessCallback) onSuccessCallback()
    },

    onError: (error: any) => {
      Alert.alert("Thất bại", error.response?.data?.errorMessages?.[0] )
    },
  })

  return {
    redeem: mutation.mutate,
    redeemAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  }
}