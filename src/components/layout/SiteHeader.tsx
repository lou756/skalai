import { Link, useLocation, useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "@/components/seo/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { Menu, X, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async (userId: string) => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      return !!data;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session) {
        const admin = await checkAdmin(session.user.id);
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
    });
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const admin = await checkAdmin(session.user.id);
        setIsAdmin(admin);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAnalyzerClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [location.pathname, navigate]);

  const navLinks = [
    { href: "/how-it-works", label: t('nav.howItWorks') },
    { href: "/methodology", label: t('nav.methodology') },
    { href: "/about", label: t('nav.about') },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              SKAL IA
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
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
            <a
              href="/#analyzer"
              onClick={handleAnalyzerClick}
              className="text-sm font-medium gradient-bg text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              {t('nav.analyze')}
            </a>
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1",
                  location.pathname === "/admin" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Shield className="h-3.5 w-3.5" />
                {t('admin.navAdmin')}
              </Link>
            )}
            <LanguageSwitcher />
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 mt-3 pt-3 pb-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.href ? "text-foreground bg-muted" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="/#analyzer"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleAnalyzerClick(e);
              }}
              className="block mx-3 mt-2 text-center text-sm font-medium gradient-bg text-primary-foreground px-4 py-2.5 rounded-lg"
            >
              {t('nav.analyze')}
            </a>
          </div>
        )}
      </div>
    </header>
  );
}