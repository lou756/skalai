import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Shield, BarChart3, Zap, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onAnalyze?: (url: string) => void;
  isLoading?: boolean;
}

export function HeroSection({ onAnalyze, isLoading }: HeroSectionProps) {
  const { t } = useI18n();
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze?.(url);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-accent/60 border border-border/50 rounded-full px-3 sm:px-4 py-1.5 mb-5 sm:mb-6">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] sm:text-xs font-medium text-accent-foreground">
              {t('hero.trusted')}
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-6 gradient-text leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t('hero.title')}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            {t('hero.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="pl-10 sm:pl-12 h-12 sm:h-13 text-sm sm:text-base rounded-xl border-border/60 bg-card/80 backdrop-blur-sm focus:glow-sm"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="h-12 sm:h-13 px-6 sm:px-7 rounded-xl gradient-bg border-0 text-primary-foreground font-semibold text-sm sm:text-base glow-md">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('search.loading')}
                  </>
                ) : (
                  t('search.button')
                )}
              </Button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-4 sm:gap-6 max-w-sm sm:max-w-lg mx-auto mt-10 sm:mt-16"
        >
          {[
            { icon: BarChart3, value: '9', label: t('hero.stat.categories') },
            { icon: Zap, value: '100%', label: t('hero.stat.realData') },
            { icon: Shield, value: 'A+', label: t('hero.stat.transparency') },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <stat.icon className="h-4 sm:h-5 w-4 sm:w-5 text-primary mx-auto mb-1.5 sm:mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}