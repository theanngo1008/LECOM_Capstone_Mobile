// src/features/chat/hooks/useChatDetailRealtime.ts
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { chatHub } from "@/api/chatHub";

export function useChatDetailRealtime({
  conversationId,
  onMessage,
}: {
  conversationId: string;
  onMessage?: (msg: any) => void;
}) {
  useFocusEffect(
    useCallback(() => {
      if (!conversationId || !onMessage) return;

      let active = true;

      const handler = (msg: any) => {
        if (!active) return;
        onMessage(msg);
      };

      const start = async () => {
        await chatHub.ensureConnection();
        await chatHub.joinConversation(conversationId);
        chatHub.onReceiveMessage(handler);
        console.log("💬 Detail subscribed for conv:", conversationId);
      };

      start();

      return () => {
        active = false;
        chatHub.offReceiveMessage(handler);
        chatHub.leaveConversation(conversationId).catch(() => {});
      };
    }, [conversationId, onMessage])
  );
}
