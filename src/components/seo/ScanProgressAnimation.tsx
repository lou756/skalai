import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";

interface ScanProgressAnimationProps {
  isLoading: boolean;
}

export function ScanProgressAnimation({ isLoading }: ScanProgressAnimationProps) {
  const { t } = useI18n();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    t('scan.step.validating'),
    t('scan.step.crawling'),
    t('scan.step.analyzing'),
    t('scan.step.checking'),
    t('scan.step.generating'),
    t('scan.step.building'),
  ];

  useEffect(() => {
    if (!isLoading) {
      setActiveStep(0);
      return;
    }

    setActiveStep(0);
    const timings = [800, 3000, 5000, 8000, 12000, 16000];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setActiveStep(i), delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="glass-card rounded-xl p-6 mb-8"
      >
        <div className="space-y-3">
          {steps.map((step, i) => {
            const isComplete = i < activeStep;
            const isActive = i === activeStep;
            const isPending = i > activeStep;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isPending ? 0.4 : 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                {isComplete ? (
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-emerald-500" />
                  </div>
                ) : isActive ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full border border-border/50" />
                )}
                <span className={`text-sm ${isActive ? 'text-foreground font-medium' : isComplete ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
