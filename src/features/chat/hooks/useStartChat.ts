import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi, StartChatPayload, StartChatResponse } from "@/api/chat";

export const useStartChat = () => {
  const queryClient = useQueryClient();

  return useMutation<StartChatResponse, any, StartChatPayload>({
    mutationFn: (payload) => chatApi.startSellerChat(payload),

    onSuccess: () => {
      // Sau khi bắt đầu chat → làm mới danh sách conversation
      queryClient.invalidateQueries({
        queryKey: ["user-conversations"],
      });

      queryClient.invalidateQueries({
        queryKey: ["seller-conversations"],
      });
    },

    onError: (err: any) => {
      console.log("Start chat error:", err);
    },
  });
};
