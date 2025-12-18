import { feedbackApi } from "@/api/feedback";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ReplyParams {
  feedbackId: string;
  replyContent: string;
}

export const useReplyFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedbackId, replyContent }: ReplyParams) =>
      feedbackApi.replyFeedback(feedbackId, { replyContent }),

    onSuccess: () => {
      // 🔥 Tự động refresh danh sách feedback của shop
      queryClient.invalidateQueries({ queryKey: ["shopFeedback"], exact: false });
    },
  });
};
