import { useMutation, useQueryClient } from "@tanstack/react-query"
import { feedbackApi, UpdateFeedbackPayload } from "@/api/feedback"
import { Alert } from "react-native"

export const useUpdateFeedback = (productId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      feedbackId,
      payload
    }: {
      feedbackId: string
      payload: UpdateFeedbackPayload
    }) => feedbackApi.updateFeedback(feedbackId, payload),

    onSuccess: () => {
      // refetch lại danh sách feedback của sản phẩm
      queryClient.invalidateQueries({
        queryKey: ["feedback-product", productId]
      })

      console.log("Cập nhật đánh giá thành công")
      // TODO: Hiển thị toast
    },

    onError: (error: any) => {
      console.log("Update feedback error:", error)
      Alert.alert("Thất bại", "Không thể cập nhật đánh giá.")
    }
  })
}

export const useDeleteFeedback = (productId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (feedbackId: string) =>
      feedbackApi.deleteFeedback(feedbackId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feedback-product", productId]
      })

      console.log("Xóa đánh giá thành công")
      // TODO: Hiển thị toast
    },

    onError: (error: any) => {
      console.log("Delete feedback error:", error)
      Alert.alert("Thất bại", "Không thể xóa đánh giá.")
    }
  })
}
