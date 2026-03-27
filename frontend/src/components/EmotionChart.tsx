import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { EMOTION_CONFIG, type Emotion, type ChatMessage } from "@/lib/emotions";
import { useMemo } from "react";

// HSL string to hex for recharts
const EMOTION_COLORS: Record<Emotion, string> = {
  joy: "#4ade80",
  anger: "#ef4444",
  sadness: "#3b82f6",
  fear: "#a855f7",
  surprise: "#eab308",
  neutral: "#6b7280",
  frustration: "#f97316",
};

interface EmotionChartProps {
  messages: ChatMessage[];
}

export function EmotionPieChart({ messages }: EmotionChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    messages.forEach((m) => {
      if (m.emotion) {
        counts[m.emotion] = (counts[m.emotion] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([emotion, count]) => ({
      name: EMOTION_CONFIG[emotion as Emotion]?.label || emotion,
      value: count,
      emotion: emotion as Emotion,
    }));
  }, [messages]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No emotion data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
          {data.map((entry) => (
            <Cell key={entry.emotion} fill={EMOTION_COLORS[entry.emotion]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(220 18% 10%)",
            border: "1px solid hsl(220 14% 18%)",
            borderRadius: "8px",
            color: "hsl(210 20% 92%)",
            fontSize: "12px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function EmotionBarChart({ messages }: EmotionChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    messages.forEach((m) => {
      if (m.emotion) {
        counts[m.emotion] = (counts[m.emotion] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([emotion, count]) => ({
      name: EMOTION_CONFIG[emotion as Emotion]?.emoji + " " + EMOTION_CONFIG[emotion as Emotion]?.label,
      count,
      fill: EMOTION_COLORS[emotion as Emotion],
    }));
  }, [messages]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No emotion data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
        <XAxis type="number" stroke="hsl(215 12% 55%)" fontSize={11} />
        <YAxis type="category" dataKey="name" stroke="hsl(215 12% 55%)" fontSize={11} width={100} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
