import { motion } from "framer-motion";
import { EmotionPieChart, EmotionBarChart } from "@/components/EmotionChart";
import { EmotionBadge } from "@/components/EmotionBadge";
import { EMOTION_CONFIG, type Emotion } from "@/lib/emotions";
import { useSessionContext } from "@/contexts/SessionContext";
import { Star, Users, MessageSquare, TrendingUp } from "lucide-react";
import { ScoreTrendChart } from "@/components/ScoreTrendChart";

export default function AnalyticsPage() {
  const { sessions, allMessages } = useSessionContext();

  const hasData = allMessages.some((m) => m.emotion);
  const displayMessages = allMessages;

  const emotionStats = Object.entries(EMOTION_CONFIG).map(([key, config]) => {
    const count = displayMessages.filter((m) => m.emotion === key).length;
    const avgConf = displayMessages
      .filter((m) => m.emotion === key && m.confidence)
      .reduce((sum, m, _, arr) => sum + (m.confidence || 0) / arr.length, 0);
    return { emotion: key as Emotion, ...config, count, avgConf };
  }).filter((s) => s.count > 0);

  const scoredMessages = displayMessages.filter((m) => m.role === "user" && m.salesScore !== undefined);
  const overallAvg = scoredMessages.length
    ? scoredMessages.reduce((sum, m) => sum + (m.salesScore || 0), 0) / scoredMessages.length
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-foreground">Emotion Analytics</h2>
        <p className="text-sm text-muted-foreground">
          {hasData
            ? `Based on ${sessions.length} session(s) and ${scoredMessages.length} scored response(s)`
            : "Start a training session in Chat to see real analytics here"}
        </p>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Sessions", value: sessions.length, icon: Users },
          { label: "Messages", value: displayMessages.length, icon: MessageSquare },
          { label: "Avg Score", value: overallAvg ? `${overallAvg.toFixed(1)}/10` : "—", icon: Star },
          { label: "Emotions Seen", value: emotionStats.length, icon: TrendingUp },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold font-mono text-foreground">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {!hasData && (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground text-sm">No session data yet. Go to <span className="text-primary font-medium">Chat</span> to start a training session.</p>
        </div>
      )}

      {hasData && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Emotion Distribution</h3>
              <div className="h-52">
                <EmotionPieChart messages={displayMessages} />
              </div>
            </div>
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Emotion Frequency</h3>
              <div className="h-52">
                <EmotionBarChart messages={displayMessages} />
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Emotion Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {emotionStats.map((s) => (
                <div key={s.emotion} className="bg-secondary/30 rounded-lg p-3 space-y-2">
                  <EmotionBadge emotion={s.emotion} size="md" />
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Count</span>
                      <span className="font-mono text-foreground">{s.count}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Avg. Conf.</span>
                      <span className="font-mono text-foreground">{Math.round(s.avgConf * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Trend */}
          {sessions.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Score Trend Over Sessions</h3>
              <div className="h-56">
                <ScoreTrendChart sessions={sessions} />
              </div>
            </div>
          )}

          {/* Session History */}
          {sessions.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Session History</h3>
              <div className="space-y-2">
                {sessions.map((session, i) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                    <span className="text-sm text-foreground flex-1">{session.personaName}</span>
                    <span className="text-xs text-muted-foreground">{session.messages.length} msgs</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className={`text-xs font-mono font-bold ${
                        session.avgScore >= 8 ? "text-green-400" : session.avgScore >= 5 ? "text-yellow-400" : "text-red-400"
                      }`}>
                        {session.avgScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
