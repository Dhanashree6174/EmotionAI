import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage, Emotion } from "@/lib/emotions";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string, personaId?: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("emotion-chat", {
        body: {
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userMessage: content,
          personaId,
        },
      });

      if (error) throw error;

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        emotion: data.detectedEmotion as Emotion,
        confidence: data.confidence,
        timestamp: new Date(),
      };

      // Tag the user message with detected emotion and sales score
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsg.id
            ? {
                ...m,
                emotion: data.detectedEmotion,
                confidence: data.confidence,
                salesScore: data.salesScore,
                salesFeedback: data.salesFeedback,
                idealResponse: data.idealResponse,
              }
            : m
        ).concat(assistantMsg)
      );
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => setMessages([]), []);

  return { messages, isLoading, sendMessage, clearChat };
}
