import { EMOTION_CONFIG, type Emotion } from "@/lib/emotions";

interface EmotionBadgeProps {
  emotion: Emotion;
  confidence?: number;
  size?: "sm" | "md";
}

export function EmotionBadge({ emotion, confidence, size = "sm" }: EmotionBadgeProps) {
  const config = EMOTION_CONFIG[emotion];
  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-full font-mono ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } ${config.badgeClass}`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
      {confidence !== undefined && (
        <span className="opacity-70">{Math.round(confidence * 100)}%</span>
      )}
    </span>
  );
}
