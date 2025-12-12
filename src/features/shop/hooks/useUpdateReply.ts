import { feedbackApi } from "@/api/feedback";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ReplyParams {
  feedbackId: string;
  replyContent: string;
}

export const useUpdateReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedbackId, replyContent }: ReplyParams) =>
      feedbackApi.updateReply(feedbackId, { replyContent }),

    onSuccess: () => {
      // 🔥 Refresh lại danh sách feedback shop
      queryClient.invalidateQueries({ queryKey: ["shop-feedback"] });
    },
  });
};
