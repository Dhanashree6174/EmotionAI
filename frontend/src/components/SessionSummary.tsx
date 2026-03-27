import { motion } from "framer-motion";
import { Star, TrendingUp, TrendingDown, BarChart3, Brain, Target, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmotionBadge } from "@/components/EmotionBadge";
import type { ChatMessage, Emotion } from "@/lib/emotions";
import { EMOTION_CONFIG } from "@/lib/emotions";
import type { CustomerPersona } from "@/components/ChatInterface";

interface SessionSummaryProps {
  messages: ChatMessage[];
  persona: CustomerPersona;
  onNewSession: () => void;
}

export function SessionSummary({ messages, persona, onNewSession }: SessionSummaryProps) {
  const userMessages = messages.filter((m) => m.role === "user" && m.salesScore !== undefined);
  const assistantMessages = messages.filter((m) => m.role === "assistant" && m.emotion);

  const avgScore = userMessages.length
    ? userMessages.reduce((sum, m) => sum + (m.salesScore || 0), 0) / userMessages.length
    : 0;

  const bestMsg = userMessages.reduce<ChatMessage | null>(
    (best, m) => (!best || (m.salesScore || 0) > (best.salesScore || 0) ? m : best),
    null
  );
  const worstMsg = userMessages.reduce<ChatMessage | null>(
    (worst, m) => (!worst || (m.salesScore || 0) < (worst.salesScore || 0) ? m : worst),
    null
  );

  const emotionCounts: Partial<Record<Emotion, number>> = {};
  assistantMessages.forEach((m) => {
    if (m.emotion) emotionCounts[m.emotion] = (emotionCounts[m.emotion] || 0) + 1;
  });

  const sortedEmotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([emotion, count]) => ({ emotion: emotion as Emotion, count }));

  const grade =
    avgScore >= 9 ? "S" :
    avgScore >= 8 ? "A" :
    avgScore >= 7 ? "B" :
    avgScore >= 6 ? "C" :
    avgScore >= 4 ? "D" : "F";

  const gradeColor =
    grade === "S" || grade === "A" ? "text-green-400" :
    grade === "B" || grade === "C" ? "text-yellow-400" : "text-red-400";

  const tips =
    avgScore >= 8
      ? "Excellent work! You demonstrated strong empathy and problem-solving skills."
      : avgScore >= 6
      ? "Good effort. Focus on showing more empathy and offering concrete solutions earlier."
      : "Keep practicing! Try to acknowledge the customer's feelings before offering solutions.";

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <h3 className="text-xl font-bold text-foreground">Session Summary</h3>
          <p className="text-sm text-muted-foreground">
            {persona.emoji} {persona.name} • {userMessages.length} exchanges
          </p>
        </motion.div>

        {/* Grade & Average Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-6 p-6 rounded-xl bg-secondary/30 border border-border/50"
        >
          <div className="text-center">
            <span className={`text-5xl font-black font-mono ${gradeColor}`}>{grade}</span>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Grade</p>
          </div>
          <div className="h-12 w-px bg-border/50" />
          <div className="text-center">
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className={`text-3xl font-bold font-mono ${
                avgScore >= 8 ? "text-green-400" : avgScore >= 5 ? "text-yellow-400" : "text-red-400"
              }`}>
                {avgScore.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">/10</span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Avg Score</p>
          </div>
        </motion.div>

        {/* Coach Tips */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-primary/5 border border-primary/10"
        >
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary/80 mb-1">Coach Feedback</p>
              <p className="text-sm text-muted-foreground">{tips}</p>
            </div>
          </div>
        </motion.div>

        {/* Best & Worst */}
        <div className="grid gap-3 sm:grid-cols-2">
          {bestMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl bg-green-500/5 border border-green-500/15"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-xs font-semibold text-green-400">Best Response</span>
                <span className="ml-auto text-xs font-mono text-green-400">{bestMsg.salesScore}/10</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3">{bestMsg.content}</p>
            </motion.div>
          )}
          {worstMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-4 rounded-xl bg-red-500/5 border border-red-500/15"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <span className="text-xs font-semibold text-red-400">Weakest Response</span>
                <span className="ml-auto text-xs font-mono text-red-400">{worstMsg.salesScore}/10</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3">{worstMsg.content}</p>
              {worstMsg.idealResponse && (
                <div className="mt-2 pt-2 border-t border-red-500/10">
                  <p className="text-[10px] uppercase tracking-wider text-red-400/70 mb-1">Ideal approach</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">{worstMsg.idealResponse}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Emotion Breakdown */}
        {sortedEmotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl bg-secondary/30 border border-border/50"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Customer Emotion Breakdown</span>
            </div>
            <div className="space-y-2">
              {sortedEmotions.map(({ emotion, count }) => {
                const config = EMOTION_CONFIG[emotion];
                const pct = (count / assistantMessages.length) * 100;
                return (
                  <div key={emotion} className="flex items-center gap-2">
                    <span className="text-sm w-5">{config.emoji}</span>
                    <span className="text-xs text-muted-foreground w-20">{config.label}</span>
                    <div className="flex-1 h-2 bg-secondary/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="h-full bg-primary/60 rounded-full"
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Score Timeline */}
        {userMessages.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="p-4 rounded-xl bg-secondary/30 border border-border/50"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Score Progression</span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {userMessages.map((m, i) => {
                const score = m.salesScore || 0;
                const height = (score / 10) * 100;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                    className={`flex-1 rounded-t ${
                      score >= 8 ? "bg-green-500/40" : score >= 5 ? "bg-yellow-500/40" : "bg-red-500/40"
                    }`}
                    title={`Message ${i + 1}: ${score}/10`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">First</span>
              <span className="text-[10px] text-muted-foreground">Last</span>
            </div>
          </motion.div>
        )}

        {/* New Session Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-2"
        >
          <Button onClick={onNewSession} className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" /> Start New Session
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
