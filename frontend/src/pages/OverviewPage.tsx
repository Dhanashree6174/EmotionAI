import { motion } from "framer-motion";
import { MessageSquare, Brain, BarChart3, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Brain,
    title: "BERT Emotion Detection",
    description: "Real-time emotion classification from customer messages using fine-tuned BERT model across 7 emotion categories.",
    color: "text-emotion-joy",
  },
  {
    icon: MessageSquare,
    title: "BART Response Generation",
    description: "Context-aware, empathetic sales responses generated using fine-tuned BART conditioned on detected emotion.",
    color: "text-emotion-sadness",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track emotion distribution, response quality scores, and training progress across sessions.",
    color: "text-emotion-surprise",
  },
  {
    icon: Zap,
    title: "Real-time Scoring",
    description: "Context-aware scoring evaluates responses against ideal references per emotion × scenario combination.",
    color: "text-emotion-frustration",
  },
];

export default function OverviewPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 py-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
          AI-Powered Sales Training
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          Emotion-Driven Virtual
          <br />
          <span className="text-primary">Customer Bot</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
          Practice your sales skills with an AI that simulates emotional customers. Using BERT for emotion detection and BART for customer simulation, handle real-world scenarios in a safe environment.
        </p>
        <Link
          to="/chat"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          Start Training
        </Link>
      </motion.div>

      {/* Feature cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="glass-card p-5 space-y-3"
          >
            <f.icon className={`h-5 w-5 ${f.color}`} />
            <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Emotion Categories", value: "7", sub: "BERT classified" },
          { label: "Model Architecture", value: "BERT+BART", sub: "Fine-tuned" },
          { label: "Response Scoring", value: "Context", sub: "Aware evaluation" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center space-y-1">
            <p className="text-xl font-bold text-primary font-mono">{stat.value}</p>
            <p className="text-xs text-foreground font-medium">{stat.label}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
