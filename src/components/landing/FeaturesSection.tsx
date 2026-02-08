import { useI18n } from "@/lib/i18n";
import { Search, ShoppingCart, FileCode, Shield } from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
  const { t } = useI18n();

  const features = [
    { icon: Search, title: t('features.seo.title'), desc: t('features.seo.desc') },
    { icon: ShoppingCart, title: t('features.merchant.title'), desc: t('features.merchant.desc') },
    { icon: FileCode, title: t('features.fixes.title'), desc: t('features.fixes.desc') },
    { icon: Shield, title: t('features.transparency.title'), desc: t('features.transparency.desc') },
  ];

  return (
    <section className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="glass-card rounded-xl p-4 sm:p-5 hover:glow-sm transition-shadow"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {f.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
