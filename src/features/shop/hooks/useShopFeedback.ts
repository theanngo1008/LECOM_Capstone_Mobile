import { feedbackApi } from "@/api/feedback"
import { useQuery } from "@tanstack/react-query"

export const useShopFeedback = (
  pageNumber: number, 
  pageSize: number = 10,
  rating?: number | null
) => {
  return useQuery({
    queryKey: ["shopFeedback", pageNumber, pageSize, rating],
    queryFn: () => feedbackApi.getShopFeedback(pageNumber, pageSize, rating),
  });
};
