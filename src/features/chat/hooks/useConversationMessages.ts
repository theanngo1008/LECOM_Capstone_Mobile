import { chatApi } from "@/api/chat";
import { useQuery } from "@tanstack/react-query";

export const useConversationMessages = (conversationId?: string, isAIChat?: boolean) => {
  return useQuery({
    queryKey: isAIChat
      ? ["chat", "ai-messages", conversationId]
      : ["chat", "messages", conversationId],

    queryFn: () => chatApi.getConversationMessages(conversationId!),
    enabled: !!conversationId,
  });
};
