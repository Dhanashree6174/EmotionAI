export type Emotion = "joy" | "anger" | "sadness" | "fear" | "surprise" | "neutral" | "frustration";

export const EMOTION_CONFIG: Record<Emotion, { label: string; emoji: string; badgeClass: string }> = {
  joy: { label: "Joy", emoji: "😊", badgeClass: "emotion-badge-joy" },
  anger: { label: "Anger", emoji: "😡", badgeClass: "emotion-badge-anger" },
  sadness: { label: "Sadness", emoji: "😢", badgeClass: "emotion-badge-sadness" },
  fear: { label: "Fear", emoji: "😨", badgeClass: "emotion-badge-fear" },
  surprise: { label: "Surprise", emoji: "😮", badgeClass: "emotion-badge-surprise" },
  neutral: { label: "Neutral", emoji: "😐", badgeClass: "emotion-badge-neutral" },
  frustration: { label: "Frustration", emoji: "😤", badgeClass: "emotion-badge-frustration" },
};

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  emotion?: Emotion;
  confidence?: number;
  salesScore?: number;
  salesFeedback?: string;
  idealResponse?: string;
  timestamp: Date;
}

export interface SessionStats {
  totalMessages: number;
  emotionCounts: Record<Emotion, number>;
  averageConfidence: number;
  sessionDuration: number;
}
