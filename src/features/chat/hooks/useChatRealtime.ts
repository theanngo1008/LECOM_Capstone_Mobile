// src/features/chat/hooks/useChatRealtime.ts
import { useEffect, useRef } from "react";
import { chatHub } from "@/api/chatHub";

export function useChatRealtime({
  userId,
  onConversationListUpdated,
}: {
  userId?: string;
  onConversationListUpdated?: (data: any) => void;
}) {
  const handlerRef = useRef(onConversationListUpdated);

  // luôn giữ ref mới nhất
  useEffect(() => {
    handlerRef.current = onConversationListUpdated;
  }, [onConversationListUpdated]);

  useEffect(() => {
    if (!userId || !handlerRef.current) return;

    let mounted = true;

    const handler = (data: any) => {
      if (!mounted) return;
      handlerRef.current?.(data);
    };

    const start = async () => {
      await chatHub.ensureConnection();
      await chatHub.joinUser(userId);
      chatHub.onConversationListUpdated(handler);
      console.log("📡 List realtime subscribed for user:", userId);
    };

    start();

    return () => {
      mounted = false;
      chatHub.offConversationListUpdated(handler);
      // KHÔNG leaveUser, vì có thể còn màn khác dùng
    };
  }, [userId]);
}
