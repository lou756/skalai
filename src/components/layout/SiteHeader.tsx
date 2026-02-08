import { Link, useLocation } from "react-router-dom";
import { LanguageSwitcher } from "@/components/seo/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t } = useI18n();
  const location = useLocation();

  const navLinks = [
    { href: "/how-it-works", label: t('nav.howItWorks') },
    { href: "/methodology", label: t('nav.methodology') },
    { href: "/about", label: t('nav.about') },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-3">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              SKAL IA
            </span>
          </Link>
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  location.pathname === link.href ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/#analyzer"
              className="text-sm font-medium gradient-bg text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              {t('nav.analyze')}
            </Link>
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
