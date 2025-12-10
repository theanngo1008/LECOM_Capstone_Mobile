import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert } from "react-native"
import { gamificationApi, RedeemRequest, RedeemResponse } from "@/api/gamification"

export function useRedeemReward(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient()
  
  const mutation = useMutation<RedeemResponse, Error, RedeemRequest>({
    mutationFn: async (payload) => {
      const res = await gamificationApi.redeemReward(payload)
      if (!res.isSuccess) {
        throw new Error(res.errorMessages?.[0] || "Đổi phần thưởng thất bại")
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

    onError: (error) => {
      Alert.alert("Thất bại", error.message)
    },
  })

  return {
    redeem: mutation.mutate,
    redeemAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  }
}