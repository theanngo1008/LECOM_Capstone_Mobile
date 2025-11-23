import { useMutation } from "@tanstack/react-query";
import { chatApi, StartChatPayload, StartChatResponse } from "@/api/chat";

export const useStartAIChat = () => {
  return useMutation<StartChatResponse, any, StartChatPayload>({
    mutationFn: (payload) => chatApi.startAIChat(payload),
  });
};
