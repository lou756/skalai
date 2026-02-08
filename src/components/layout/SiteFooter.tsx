import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border/50 bg-card/50 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg gradient-bg flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">S</span>
              </div>
              <span className="font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SKAL IA</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">{t('footer.product')}</h4>
            <ul className="space-y-2">
              <li><Link to="/#analyzer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.analyze')}</Link></li>
              <li><Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.howItWorks')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">{t('footer.company')}</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer.legal')}</Link></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer.privacy')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 mt-8 pt-6">
          <p className="text-xs text-muted-foreground text-center">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
