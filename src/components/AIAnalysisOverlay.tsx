import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Package, Globe, CheckCircle2, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AIAnalysisOverlayProps {
  active: boolean;
  onComplete: () => void;
}

const steps = [
  {
    icon: Brain,
    label: "AI Context Parsing...",
    detail: "Analyzing fabric texture, silhouette, and color profile",
    subDetail: "Model: GPT-5o Vision · Confidence: 96.4%",
    duration: 1800,
  },
  {
    icon: Package,
    label: "Identifying HS Code for Customs...",
    detail: "Material: 70% Viscose, 30% Polyamide → Knitted garment",
    subDetail: "HS Code: 6110.30 — Knitted articles of apparel, of man-made fibres",
    duration: 1600,
  },
  {
    icon: Globe,
    label: "Checking Global Inventory...",
    detail: "Scanning 847 retailers across 42 countries",
    subDetail: "Result: 0/847 in stock · Redirecting to secondary market",
    duration: 1400,
  },
];

const AIAnalysisOverlay = ({ active, onComplete }: AIAnalysisOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepProgress, setStepProgress] = useState(0);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setCurrentStep(-1);
      setStepProgress(0);
      setAllDone(false);
      return;
    }

    // Start first step
    setCurrentStep(0);
    setStepProgress(0);

    let stepIdx = 0;
    const runStep = () => {
      setCurrentStep(stepIdx);
      setStepProgress(0);

      // Animate progress
      const progressInterval = setInterval(() => {
        setStepProgress((p) => Math.min(p + 3, 100));
      }, steps[stepIdx].duration / 35);

      setTimeout(() => {
        clearInterval(progressInterval);
        setStepProgress(100);
        stepIdx++;

        if (stepIdx < steps.length) {
          setTimeout(() => runStep(), 300);
        } else {
          setAllDone(true);
          setTimeout(() => onComplete(), 800);
        }
      }, steps[stepIdx].duration);
    };

    const timer = setTimeout(() => runStep(), 400);
    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active) return null;

  const totalProgress = allDone
    ? 100
    : Math.round(((currentStep + stepProgress / 100) / steps.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-background/85 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-6"
    >
      {/* Glow ring */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute w-32 h-32 rounded-full bg-accent/10 blur-2xl"
      />

      {/* Patent badge top */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2 py-1 bg-secondary/80 rounded border border-border">
        <Shield className="w-3 h-3 text-gold" />
        <span className="text-[8px] font-display font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Patent Pending
        </span>
      </div>

      {/* Main progress */}
      <div className="w-full max-w-[280px] space-y-5 relative z-10">
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: allDone ? 0 : 360 }}
            transition={allDone ? {} : { repeat: Infinity, duration: 3, ease: "linear" }}
          >
            {allDone ? (
              <CheckCircle2 className="w-8 h-8 text-checkout mx-auto" />
            ) : (
              <Brain className="w-8 h-8 text-accent mx-auto" />
            )}
          </motion.div>
          <p className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-muted-foreground mt-3">
            {allDone ? "Analysis Complete" : "AI-Driven Market Analysis"}
          </p>
        </div>

        {/* Overall progress bar */}
        <div className="space-y-1.5">
          <Progress value={totalProgress} className="h-1.5 bg-secondary" />
          <div className="flex justify-between">
            <span className="text-[9px] text-muted-foreground font-mono">{totalProgress}%</span>
            <span className="text-[9px] text-muted-foreground font-mono">
              {currentStep + 1}/{steps.length}
            </span>
          </div>
        </div>

        {/* Step list */}
        <div className="space-y-3">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep || allDone;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{
                  opacity: i <= currentStep || allDone ? 1 : 0.3,
                  x: 0,
                }}
                transition={{ delay: i * 0.15, duration: 0.3 }}
                className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                  isActive ? "bg-accent/5 border border-accent/20" : isDone ? "bg-checkout/5 border border-checkout/15" : "border border-transparent"
                }`}
              >
                <div className={`mt-0.5 ${isDone ? "text-checkout" : isActive ? "text-accent" : "text-muted-foreground/40"}`}>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <StepIcon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-display font-semibold ${isDone ? "text-checkout" : isActive ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {isDone ? step.label.replace("...", " ✓") : step.label}
                  </p>
                  {(isActive || isDone) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden"
                    >
                      <p className="text-[9px] text-muted-foreground mt-0.5 font-mono leading-relaxed">
                        {step.detail}
                      </p>
                      <p className="text-[8px] text-muted-foreground/60 mt-0.5 font-mono">
                        {step.subDetail}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default AIAnalysisOverlay;
