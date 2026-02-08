import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useI18n } from "@/lib/i18n";
import { Target, Shield, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const About = () => {
  const { t } = useI18n();

  const sections = [
    { icon: Target, title: t('about.mission.title'), desc: t('about.mission.desc') },
    { icon: Shield, title: t('about.credibility.title'), desc: t('about.credibility.desc') },
    { icon: Cpu, title: t('about.tech.title'), desc: t('about.tech.desc') },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
          {t('about.backHome')}
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight gradient-text mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('about.title')}
          </h1>
          <p className="text-lg text-muted-foreground">{t('about.subtitle')}</p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {section.title}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default About;
