import { useQuery } from "@tanstack/react-query";
import { feedbackApi } from "@/api/feedback";

export function useFeedbackByProduct(
  productId: string,
  pageNumber = 1,
  pageSize = 10,
  rating?: number
) {
  return useQuery({
    queryKey: ["feedback-product", productId, pageNumber, pageSize, rating],
    queryFn: () =>
      feedbackApi.getFeedbackByProduct(productId, pageNumber, pageSize, rating),
    enabled: !!productId, // chỉ chạy khi có productId
  });
}
