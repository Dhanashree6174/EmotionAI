import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { SessionRecord } from "@/contexts/SessionContext";
import { useMemo } from "react";
import { format } from "date-fns";

interface ScoreTrendChartProps {
  sessions: SessionRecord[];
}

export function ScoreTrendChart({ sessions }: ScoreTrendChartProps) {
  const data = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
      .map((s, i) => ({
        name: `#${i + 1}`,
        score: Number(s.avgScore.toFixed(1)),
        persona: s.personaName,
        date: format(new Date(s.startedAt), "MMM d, HH:mm"),
      }));
  }, [sessions]);

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Complete at least 2 sessions to see your trend
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
        <XAxis dataKey="name" stroke="hsl(215 12% 55%)" fontSize={11} />
        <YAxis domain={[0, 10]} stroke="hsl(215 12% 55%)" fontSize={11} />
        <ReferenceLine y={7} stroke="hsl(142 71% 45%)" strokeDasharray="4 4" label={{ value: "Good", fill: "hsl(142 71% 45%)", fontSize: 10, position: "right" }} />
        <Tooltip
          contentStyle={{
            background: "hsl(220 18% 10%)",
            border: "1px solid hsl(220 14% 18%)",
            borderRadius: "8px",
            color: "hsl(210 20% 92%)",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`${value}/10`, "Score"]}
          labelFormatter={(_, payload) => {
            const item = payload?.[0]?.payload;
            return item ? `${item.persona} — ${item.date}` : "";
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="hsl(262 83% 58%)"
          strokeWidth={2}
          dot={{ fill: "hsl(262 83% 58%)", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
