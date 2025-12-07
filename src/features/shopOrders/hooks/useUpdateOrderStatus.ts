import { useMutation, useQueryClient } from "@tanstack/react-query"
import { shopOrdersApi, OrderStatus } from "@/api/shopOrders"
import { Alert } from "react-native"

export const useUpdateOrderStatus = (orderId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: OrderStatus) =>
      shopOrdersApi.updateOrderStatus(orderId, status),

    onSuccess: () => {
      console.log("Update order status success!")

      // Refetch danh sách đơn
      queryClient.invalidateQueries({
        queryKey: ["shopOrders"]
      })

      // Refetch chi tiết đơn (nếu đang ở trang detail)
      queryClient.invalidateQueries({
        queryKey: ["shopOrderDetail", orderId]
      })

      // TODO: Thay Alert bằng Toast trong app bạn
      Alert.alert("Thành công", "Cập nhật trạng thái đơn hàng thành công.")
    },

    onError: (error: any) => {
      console.log("Update order status error:", error)
      Alert.alert("Thất bại", "Không thể cập nhật trạng thái đơn hàng.")
    }
  })
}
