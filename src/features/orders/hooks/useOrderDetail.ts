import { useQuery } from "@tanstack/react-query"
import { ordersApi } from "@/api/orders"

export const useOrderDetail = (orderId: string) => {
  return useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: !!orderId, // chỉ chạy khi có orderId
    refetchOnMount: true, // Refetch mỗi khi component mount
    staleTime: 0, // Data luôn được coi là stale, luôn refetch khi cần
  })
}
