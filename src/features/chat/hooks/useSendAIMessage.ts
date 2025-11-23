import { chatApi, SendMessagePayload, SendMessageResponse } from "@/api/chat";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSendAIMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation<SendMessageResponse, any, SendMessagePayload>({
    mutationFn: (payload) => chatApi.sendAIMessage(conversationId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", conversationId],
      });
    },
  });
};
