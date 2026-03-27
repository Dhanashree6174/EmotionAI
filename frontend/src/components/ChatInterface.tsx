import { useState, useRef, useEffect } from "react";
import {
  Send,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Star,
  ShoppingBag,
  AlertTriangle,
  DollarSign,
  Frown,
  HelpCircle,
  ArrowLeft,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmotionBadge } from "@/components/EmotionBadge";
import { useChat } from "@/hooks/useChat";
import { useSessionContext } from "@/contexts/SessionContext";
import { SessionSummary } from "@/components/SessionSummary";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export type CustomerPersona = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  prompt: string;
  difficulty: "Easy" | "Medium" | "Hard";
  icon: typeof ShoppingBag;
};

const PERSONAS: CustomerPersona[] = [
  {
    id: "angry-returner",
    name: "Angry Returner",
    emoji: "😡",
    description:
      "Bought a product that broke after 2 days. Wants a full refund and is furious about the experience.",
    prompt:
      "You are an ANGRY customer who bought a product that broke after just 2 days. You want a full refund immediately. You feel cheated and disrespected. Start aggressive and only calm down if the salesperson shows genuine empathy and offers a clear solution.",
    difficulty: "Hard",
    icon: AlertTriangle,
  },
  {
    id: "nervous-first-timer",
    name: "Nervous First-Timer",
    emoji: "😰",
    description:
      "First time buying this type of product. Overwhelmed by options and afraid of making a wrong choice.",
    prompt:
      "You are a NERVOUS first-time customer who has never bought this type of product before. You're overwhelmed by all the options and scared of wasting money on the wrong thing. You need reassurance and patience. Ask lots of questions and second-guess yourself.",
    difficulty: "Easy",
    icon: HelpCircle,
  },
  {
    id: "price-haggler",
    name: "Price Haggler",
    emoji: "🤑",
    description:
      "Loves the product but thinks it's overpriced. Will push hard for discounts, bundles, or extras.",
    prompt:
      "You are a SHREWD price haggler. You love the product but think it's way overpriced. You'll constantly push for discounts, mention competitor prices, ask for free extras, and threaten to walk away. Only relent if the salesperson demonstrates clear value.",
    difficulty: "Medium",
    icon: DollarSign,
  },
  {
    id: "disappointed-loyal",
    name: "Disappointed Loyal Customer",
    emoji: "😞",
    description:
      "Been a customer for years but recent quality has dropped. Considering switching to a competitor.",
    prompt:
      "You are a DISAPPOINTED long-time loyal customer. You've been buying from this company for 5 years but the last 3 purchases have been terrible quality. You're sad and considering switching to a competitor. You want to feel valued and heard, not given scripted apologies.",
    difficulty: "Hard",
    icon: Frown,
  },
  {
    id: "impulse-buyer",
    name: "Impulse Buyer",
    emoji: "🛍️",
    description:
      "Excited and ready to buy everything but needs guidance to avoid buyer's remorse.",
    prompt:
      "You are an EXCITED impulse buyer who wants to buy everything in sight. You're enthusiastic but disorganized. A good salesperson should help you focus on what you actually need without dampening your excitement. If they just let you buy everything, you'll have buyer's remorse later.",
    difficulty: "Easy",
    icon: ShoppingBag,
  },
];

const GREETINGS = [
  "Hello, how can I help you today?",
  "Hi there! Welcome, what brings you in today?",
  "Good morning! I'm here to assist you with anything you need.",
];

export function ChatInterface() {
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const { setCurrentMessages, saveSession } = useSessionContext();
  const [input, setInput] = useState("");
  const [expandedFeedback, setExpandedFeedback] = useState<Set<string>>(
    new Set(),
  );
  const [selectedPersona, setSelectedPersona] =
    useState<CustomerPersona | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Sync messages to context for analytics
  useEffect(() => {
    setCurrentMessages(messages);
  }, [messages, setCurrentMessages]);

  // Auto-end session if high-confidence anger count exceeds threshold
  useEffect(() => {
    if (sessionEnded || !selectedPersona) return;
    const highAngerCount = messages.filter(
      (m) => m.emotion === "anger" && (m.confidence ?? 0) > 0.95,
    ).length;
    if (highAngerCount >= 7) {
      // Bot "walks away" — end the session automatically
      const walkAwayMsg = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content:
          "You know what? I've had enough. I'm done talking to you — I'm taking my business elsewhere. *Customer has left the conversation.*",
        emotion: "anger" as const,
        confidence: 1.0,
        timestamp: new Date(),
      };
      // We can't mutate messages from useChat, so we save with current messages + walkaway
      const finalMessages = [...messages, walkAwayMsg];
      setCurrentMessages(finalMessages);
      saveSession(selectedPersona.id, selectedPersona.name, finalMessages);
      setSessionEnded(true);
    }
  }, [
    messages,
    sessionEnded,
    selectedPersona,
    setCurrentMessages,
    saveSession,
  ]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim(), selectedPersona?.id);
    setInput("");
  };

  const handleEndSession = () => {
    if (selectedPersona) {
      saveSession(selectedPersona.id, selectedPersona.name, messages);
    }
    setSessionEnded(true);
  };

  const handleReset = () => {
    clearChat();
    setCurrentMessages([]);
    setSelectedPersona(null);
    setExpandedFeedback(new Set());
    setSessionEnded(false);
  };

  // Session summary screen
  if (sessionEnded && selectedPersona) {
    return (
      <SessionSummary
        messages={messages}
        persona={selectedPersona}
        onNewSession={handleReset}
      />
    );
  }

  // Persona selection screen
  if (!selectedPersona) {
    return (
      <div className="flex flex-col h-full overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h3 className="text-xl font-bold text-foreground">
              Choose a Customer Persona
            </h3>
            <p className="text-sm text-muted-foreground">
              Select the type of customer you want to practice with
            </p>
          </motion.div>
          <div className="grid gap-3">
            {PERSONAS.map((persona, i) => {
              const Icon = persona.icon;
              return (
                <motion.button
                  key={persona.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelectedPersona(persona)}
                  className="group text-left p-4 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{persona.emoji}</span>
                        <span className="font-semibold text-foreground">
                          {persona.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full ${
                            persona.difficulty === "Hard"
                              ? "bg-red-500/15 text-red-400"
                              : persona.difficulty === "Medium"
                                ? "bg-yellow-500/15 text-yellow-400"
                                : "bg-green-500/15 text-green-400"
                          }`}
                        >
                          {persona.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {persona.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Greeting selection (after persona, before first message)
  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl">{selectedPersona.emoji}</span>
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedPersona.name}
                </h3>
                <span
                  className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full ${
                    selectedPersona.difficulty === "Hard"
                      ? "bg-red-500/15 text-red-400"
                      : selectedPersona.difficulty === "Medium"
                        ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-green-500/15 text-green-400"
                  }`}
                >
                  {selectedPersona.difficulty}
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                {selectedPersona.description}
              </p>
              <button
                onClick={() => setSelectedPersona(null)}
                className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 mx-auto"
              >
                <ArrowLeft className="h-3 w-3" /> Change persona
              </button>
            </motion.div>
            <div className="grid gap-2 max-w-lg w-full">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Start with a greeting:
              </p>
              {GREETINGS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s, selectedPersona.id)}
                  className="text-left text-sm p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors border border-border/50"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Or type your own greeting..."
                className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <Button onClick={handleSend} disabled={!input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Persona indicator */}
      <div className="px-4 py-2 border-b border-border/50 flex items-center gap-2 bg-secondary/20">
        <span className="text-sm">{selectedPersona.emoji}</span>
        <span className="text-xs font-medium text-foreground">
          {selectedPersona.name}
        </span>
        <span
          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full ${
            selectedPersona.difficulty === "Hard"
              ? "bg-red-500/15 text-red-400"
              : selectedPersona.difficulty === "Medium"
                ? "bg-yellow-500/15 text-yellow-400"
                : "bg-green-500/15 text-green-400"
          }`}
        >
          {selectedPersona.difficulty}
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary/15 border border-primary/20 text-foreground"
                    : "glass-card text-foreground"
                }`}
              >
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.role === "user" && msg.salesScore !== undefined && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        <span
                          className={`text-xs font-bold font-mono ${
                            msg.salesScore >= 8
                              ? "text-green-400"
                              : msg.salesScore >= 5
                                ? "text-yellow-400"
                                : "text-red-400"
                          }`}
                        >
                          {msg.salesScore}/10
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {msg.salesFeedback}
                      </span>
                      <button
                        onClick={() =>
                          setExpandedFeedback((prev) => {
                            const next = new Set(prev);
                            next.has(msg.id)
                              ? next.delete(msg.id)
                              : next.add(msg.id);
                            return next;
                          })
                        }
                        className="ml-auto text-xs text-primary/70 hover:text-primary flex items-center gap-0.5"
                      >
                        {expandedFeedback.has(msg.id) ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        Ideal
                      </button>
                    </div>
                    <AnimatePresence>
                      {expandedFeedback.has(msg.id) && msg.idealResponse && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="text-xs bg-primary/5 border border-primary/10 rounded-md p-2 text-muted-foreground">
                            <span className="font-semibold text-primary/80">
                              Ideal response:{" "}
                            </span>
                            {msg.idealResponse}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {msg.emotion && (
                  <div className="mt-2 flex items-center gap-2">
                    <EmotionBadge
                      emotion={msg.emotion}
                      confidence={msg.confidence}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass-card px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-primary animate-pulse-glow"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Analyzing emotion...
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            className="shrink-0"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleEndSession}
            className="shrink-0 gap-1.5 text-xs"
            disabled={
              messages.filter(
                (m) => m.role === "user" && m.salesScore !== undefined,
              ).length === 0
            }
            title="End session & view summary"
          >
            <Flag className="h-3.5 w-3.5" />
            End Session
          </Button>
          <div className="flex-1 flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Respond as a salesperson..."
              className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
