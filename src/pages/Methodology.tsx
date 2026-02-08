import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useI18n } from "@/lib/i18n";
import { Shield, Globe, Cpu, FileText, AlertTriangle, CheckCircle2, Database, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Methodology = () => {
  const { t } = useI18n();

  const techStack = [
    { icon: Globe, name: "Firecrawl", desc: t('method.tech.firecrawl') },
    { icon: Database, name: "Firecrawl Map API", desc: t('method.tech.map') },
    { icon: Cpu, name: "Lovable AI Gateway (Gemini)", desc: t('method.tech.ai') },
    { icon: Zap, name: "Direct HTTP", desc: t('method.tech.http') },
  ];

  const steps = [
    { num: "01", title: t('method.step1.title'), desc: t('method.step1.desc') },
    { num: "02", title: t('method.step2.title'), desc: t('method.step2.desc') },
    { num: "03", title: t('method.step3.title'), desc: t('method.step3.desc') },
    { num: "04", title: t('method.step4.title'), desc: t('method.step4.desc') },
    { num: "05", title: t('method.step5.title'), desc: t('method.step5.desc') },
    { num: "06", title: t('method.step6.title'), desc: t('method.step6.desc') },
  ];

  const limits = [
    t('method.limit.cloudflare'),
    t('method.limit.auth'),
    t('method.limit.js'),
    t('method.limit.links'),
  ];

  const scoring = [
    { cat: "Meta Tags", weight: "20/100" },
    { cat: "Content & Structure", weight: "15/100" },
    { cat: "Indexability", weight: "20/100" },
    { cat: "Social & Sharing", weight: "10/100" },
    { cat: "Mobile & Performance", weight: "15/100" },
    { cat: "Links Health", weight: "10/100" },
    { cat: "Internationalization", weight: "10/100" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
          {t('method.backHome')}
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/60 border border-border/50 rounded-full px-4 py-1.5 mb-6">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-accent-foreground">{t('method.badge')}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('method.title')}
          </h1>
          <p className="text-lg text-muted-foreground">{t('method.subtitle')}</p>
        </motion.div>

        {/* Technologies */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('method.techTitle')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {techStack.map((tech, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card rounded-xl p-5 flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <tech.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{tech.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tech.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('method.processTitle')}
          </h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex gap-4 glass-card rounded-xl p-5">
                <span className="text-2xl font-bold gradient-text shrink-0 w-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{step.num}</span>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scoring */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('method.scoringTitle')}
          </h2>
          <div className="glass-card rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-4">{t('method.scoringDesc')}</p>
            <div className="space-y-3">
              {scoring.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <span className="text-sm font-medium text-foreground">{s.cat}</span>
                  <span className="text-sm font-semibold gradient-text">{s.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confidence */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('method.confidenceTitle')}
          </h2>
          <div className="glass-card rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-4">{t('method.confidenceDesc')}</p>
            <div className="space-y-2">
              {[
                { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, label: t('confidence.verified'), desc: t('method.conf.verified') },
                { icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, label: t('confidence.partial'), desc: t('method.conf.partial') },
                { icon: <AlertTriangle className="h-4 w-4 text-destructive" />, label: t('confidence.uncertain'), desc: t('method.conf.uncertain') },
              ].map((level, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
                  {level.icon}
                  <div>
                    <span className="text-sm font-medium text-foreground">{level.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{level.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Limitations */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('method.limitsTitle')}
          </h2>
          <div className="glass-card rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-4">{t('method.limitsDesc')}</p>
            <div className="space-y-2">
              {limits.map((limit, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{limit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-xl p-6 text-center border-primary/20">
            <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t('method.certTitle')}</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[t('method.cert.realData'), t('method.cert.noSimulation'), t('method.cert.transparent'), t('method.cert.gdpr')].map((cert, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Methodology;
