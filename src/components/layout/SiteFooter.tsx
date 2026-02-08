import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border/50 bg-card/50 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg gradient-bg flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">S</span>
              </div>
              <span className="font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SKAL IA</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 sm:mb-3">{t('footer.product')}</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link to="/#analyzer" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.analyze')}</Link></li>
              <li><Link to="/how-it-works" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.howItWorks')}</Link></li>
              <li><Link to="/methodology" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.methodology')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 sm:mb-3">{t('footer.company')}</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link to="/about" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/legal" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer.legal')}</Link></li>
              <li><Link to="/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer.privacy')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 mt-6 sm:mt-8 pt-4 sm:pt-6">
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
