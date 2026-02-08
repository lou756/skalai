import { SEOAnalyzer } from "@/components/seo/SEOAnalyzer";
import { LanguageSwitcher } from "@/components/seo/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

const Index = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-xl font-semibold text-foreground">
              SKAL IA
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.howItWorks')}
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.about')}
              </a>
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            SKAL IA
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
            {t('hero.subtitle')}
          </p>
          <p className="text-lg text-primary font-medium max-w-2xl mx-auto">
            {t('hero.tagline')}
          </p>
        </section>

        <SEOAnalyzer />
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground text-center">
            {t('footer.tagline')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
