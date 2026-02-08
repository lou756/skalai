import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";

const Privacy = () => {
  const { locale } = useI18n();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-6 py-16 max-w-2xl">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
          {locale === 'fr' ? '← Retour à l\'accueil' : '← Back to home'}
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {locale === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy'}
        </h1>
        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p>{locale === 'fr'
            ? 'SKAL IA respecte votre vie privée. Aucune donnée personnelle n\'est collectée, stockée ou partagée lors de l\'utilisation de notre outil d\'analyse SEO.'
            : 'SKAL IA respects your privacy. No personal data is collected, stored, or shared when using our SEO analysis tool.'
          }</p>
          <p>{locale === 'fr'
            ? 'Les URLs analysées sont traitées en temps réel et ne sont pas conservées après l\'analyse. Aucun cookie de suivi n\'est utilisé.'
            : 'Analyzed URLs are processed in real-time and are not retained after analysis. No tracking cookies are used.'
          }</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Privacy;
