import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage } from "@/lib/emotions";

export interface SessionRecord {
  id: string;
  personaId: string;
  personaName: string;
  messages: ChatMessage[];
  avgScore: number;
  startedAt: Date;
  endedAt: Date;
}

interface SessionContextValue {
  sessions: SessionRecord[];
  currentMessages: ChatMessage[];
  setCurrentMessages: (msgs: ChatMessage[]) => void;
  saveSession: (personaId: string, personaName: string, messages: ChatMessage[]) => void;
  allMessages: ChatMessage[];
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions from database on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const { data, error } = await supabase
          .from("training_sessions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to load sessions:", error);
          return;
        }

        const loaded: SessionRecord[] = (data || []).map((row: any) => ({
          id: row.id,
          personaId: row.persona_id,
          personaName: row.persona_name,
          messages: (row.messages as any[]).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
          avgScore: Number(row.avg_score),
          startedAt: new Date(row.started_at),
          endedAt: new Date(row.ended_at),
        }));

        setSessions(loaded);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  const saveSession = useCallback(async (personaId: string, personaName: string, messages: ChatMessage[]) => {
    if (messages.length === 0) return;
    const scored = messages.filter((m) => m.role === "user" && m.salesScore !== undefined);
    const avgScore = scored.length
      ? scored.reduce((sum, m) => sum + (m.salesScore || 0), 0) / scored.length
      : 0;

    const record: SessionRecord = {
      id: crypto.randomUUID(),
      personaId,
      personaName,
      messages,
      avgScore,
      startedAt: messages[0]?.timestamp || new Date(),
      endedAt: new Date(),
    };

    // Optimistic local update
    setSessions((prev) => [record, ...prev]);

    // Persist to database
    const { error } = await supabase.from("training_sessions").insert({
      id: record.id,
      persona_id: personaId,
      persona_name: personaName,
      messages: JSON.parse(JSON.stringify(messages)),
      avg_score: avgScore,
      started_at: record.startedAt.toISOString(),
      ended_at: record.endedAt.toISOString(),
    });

    if (error) {
      console.error("Failed to save session:", error);
    }
  }, []);

  const allMessages = [
    ...sessions.flatMap((s) => s.messages),
    ...currentMessages,
  ];

  return (
    <SessionContext.Provider value={{ sessions, currentMessages, setCurrentMessages, saveSession, allMessages, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSessionContext must be used within SessionProvider");
  return ctx;
}
