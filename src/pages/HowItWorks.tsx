import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useI18n } from "@/lib/i18n";
import { Globe, Search, Cpu, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const { t } = useI18n();

  const steps = [
    { icon: Globe, title: t('how.step1.title'), desc: t('how.step1.desc') },
    { icon: Search, title: t('how.step2.title'), desc: t('how.step2.desc') },
    { icon: Cpu, title: t('how.step3.title'), desc: t('how.step3.desc') },
    { icon: FileText, title: t('how.step4.title'), desc: t('how.step4.desc') },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
          {t('how.backHome')}
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight gradient-text mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('how.title')}
          </h1>
          <p className="text-lg text-muted-foreground">{t('how.subtitle')}</p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex gap-5 glass-card rounded-xl p-6"
            >
              <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                <step.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {step.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default HowItWorks;
