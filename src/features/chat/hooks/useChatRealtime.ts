import { useEffect } from "react";
import { chatHub } from "@/api/chatHub";

export const useChatRealtime = (
  conversationId?: string,
  onMessage?: (msg: any) => void
) => {
  useEffect(() => {
    if (!conversationId) return;

    let isMounted = true;

    const run = async () => {
      try {
        // 🔥 Ensure connection + join correct conversation
        await chatHub.connect(conversationId);

        if (!isMounted) return;

        // 🔥 Attach listener only once
        chatHub.onReceiveMessage((msg) => {
          if (onMessage) onMessage(msg);
        });
      } catch (err) {
        console.log("Realtime error:", err);
      }
    };

    run();

    return () => {
      isMounted = false;

      // ❗Chỉ remove listener — KHÔNG stop connection
      chatHub.offReceiveMessage();
    };
  }, [conversationId]);
};
