import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";

const Legal = () => {
  const { locale } = useI18n();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-6 py-16 max-w-2xl">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
          {locale === 'fr' ? '← Retour à l\'accueil' : '← Back to home'}
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {locale === 'fr' ? 'Mentions légales' : 'Legal Notice'}
        </h1>
        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p>{locale === 'fr'
            ? 'SKAL IA est une plateforme d\'analyse SEO et d\'audit web. Les résultats fournis sont basés sur des données réelles extraites au moment de l\'analyse. Ils constituent des recommandations et ne garantissent pas un positionnement spécifique dans les moteurs de recherche.'
            : 'SKAL IA is an SEO analysis and web audit platform. Results provided are based on real data extracted at the time of analysis. They constitute recommendations and do not guarantee specific search engine ranking.'
          }</p>
          <p>{locale === 'fr'
            ? 'Les données analysées ne sont pas stockées de manière permanente. Aucune donnée personnelle n\'est collectée lors de l\'utilisation de l\'outil d\'analyse.'
            : 'Analyzed data is not permanently stored. No personal data is collected during the use of the analysis tool.'
          }</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Legal;
