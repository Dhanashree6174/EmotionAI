import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Customer Input",
    desc: "User types an emotional customer message simulating a real sales scenario.",
    tech: "React Frontend",
  },
  {
    num: "02",
    title: "Emotion Detection (BERT)",
    desc: "Fine-tuned BERT classifies the message into 7 emotion categories with confidence scores.",
    tech: "BERT Sequence Classification",
  },
  {
    num: "03",
    title: "Context Encoding",
    desc: "Message content, detected emotion, and scenario context are encoded into a structured prompt.",
    tech: "Context Pipeline",
  },
  {
    num: "04",
    title: "Response Generation (BART)",
    desc: "Fine-tuned BART generates empathetic, context-aware sales responses conditioned on emotion.",
    tech: "BART Seq2Seq",
  },
  {
    num: "05",
    title: "Quality Scoring",
    desc: "Response scored against ideal references per emotion × scenario combination using BLEU and coherence.",
    tech: "Evaluation Module",
  },
];

export default function ArchitecturePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-foreground">System Architecture</h2>
        <p className="text-sm text-muted-foreground">BERT + BART pipeline for emotion-driven sales training</p>
      </motion.div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 flex gap-4 items-start"
          >
            <div className="text-2xl font-bold text-primary/30 font-mono shrink-0">{step.num}</div>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-foreground text-sm">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
            <span className="text-[10px] font-mono text-primary/60 bg-primary/5 px-2 py-1 rounded shrink-0">
              {step.tech}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-5 space-y-3">
        <h3 className="font-semibold text-foreground text-sm">Key Improvements (v3)</h3>
        <ul className="space-y-2 text-xs text-muted-foreground">
          {[
            "10× richer BART training — multiple response styles per emotion",
            "BART trained on full (customer_msg, emotion, context) → response",
            "Context-aware scoring — evaluates against actual customer query",
            "Separate ideal references per (emotion × scenario_type)",
            "BART eval: coherence + category accuracy + BLEU all reported",
            "BERT maintained at 80%+ accuracy with v2 improvements",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
