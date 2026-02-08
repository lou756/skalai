import { useI18n } from "@/lib/i18n";
import { ArrowDown, Shield, BarChart3, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  const { t } = useI18n();

  const scrollToAnalyzer = () => {
    document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-accent/60 border border-border/50 rounded-full px-4 py-1.5 mb-6">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-accent-foreground">
              {t('hero.trusted')}
            </span>
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6 gradient-text"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t('hero.title')}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <button
            onClick={scrollToAnalyzer}
            className="gradient-bg text-primary-foreground px-8 py-3.5 rounded-xl text-base font-semibold hover:opacity-90 transition-all glow-md inline-flex items-center gap-2"
          >
            {t('hero.cta')}
            <ArrowDown className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16"
        >
          {[
            { icon: BarChart3, value: '7', label: 'SEO categories' },
            { icon: Zap, value: '100%', label: 'Real data' },
            { icon: Shield, value: 'A+', label: 'Transparency' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
