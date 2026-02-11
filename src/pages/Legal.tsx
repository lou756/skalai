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
        <div className="prose prose-sm text-muted-foreground space-y-6">
          {/* Éditeur */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Éditeur du site' : 'Site Publisher'}
            </h2>
            <ul className="space-y-1 list-none pl-0">
              <li><strong>{locale === 'fr' ? 'Raison sociale' : 'Company'}:</strong> SKAL IA</li>
              <li><strong>{locale === 'fr' ? 'Forme juridique' : 'Legal form'}:</strong> {locale === 'fr' ? 'Micro-entreprise' : 'Sole proprietorship'}</li>
              <li><strong>SIRET:</strong> {locale === 'fr' ? 'En cours d\'immatriculation' : 'Registration pending'}</li>
              <li><strong>{locale === 'fr' ? 'Responsable de la publication' : 'Publication director'}:</strong> SKAL IA</li>
              <li><strong>Email:</strong> contact@skal.digital</li>
            </ul>
          </section>

          {/* Hébergeur */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Hébergement' : 'Hosting'}
            </h2>
            <ul className="space-y-1 list-none pl-0">
              <li><strong>{locale === 'fr' ? 'Hébergeur' : 'Host'}:</strong> Lovable (Lovable Technologies Inc.)</li>
              <li><strong>{locale === 'fr' ? 'Adresse' : 'Address'}:</strong> San Francisco, CA, USA</li>
              <li><strong>Site:</strong> <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">lovable.dev</a></li>
            </ul>
          </section>

          {/* Nature du service */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Nature du service' : 'Service Description'}
            </h2>
            <p>{locale === 'fr'
              ? 'SKAL IA est une plateforme d\'analyse SEO et d\'audit web. Les résultats fournis sont basés sur des données réelles extraites au moment de l\'analyse. Ils constituent des recommandations et ne garantissent pas un positionnement spécifique dans les moteurs de recherche.'
              : 'SKAL IA is an SEO analysis and web audit platform. Results provided are based on real data extracted at the time of analysis. They constitute recommendations and do not guarantee specific search engine ranking.'
            }</p>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Propriété intellectuelle' : 'Intellectual Property'}
            </h2>
            <p>{locale === 'fr'
              ? 'L\'ensemble du contenu de ce site (textes, graphiques, logos, icônes, logiciels) est la propriété exclusive de SKAL IA, sauf mention contraire. Toute reproduction, représentation ou diffusion, en tout ou partie, sans autorisation préalable est interdite.'
              : 'All content on this site (text, graphics, logos, icons, software) is the exclusive property of SKAL IA, unless otherwise stated. Any reproduction, representation or distribution, in whole or in part, without prior authorization is prohibited.'
            }</p>
          </section>

          {/* Données personnelles */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Données personnelles' : 'Personal Data'}
            </h2>
            <p>{locale === 'fr'
              ? 'Les données analysées ne sont pas stockées de manière permanente. Les URLs analysées sont traitées en temps réel. Conformément au RGPD, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à contact@skal.digital.'
              : 'Analyzed data is not permanently stored. Analyzed URLs are processed in real-time. In accordance with GDPR, you have the right to access, rectify and delete your data. To exercise these rights, contact us at contact@skal.digital.'
            }</p>
          </section>

          {/* DPO */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Délégué à la Protection des Données (DPO)' : 'Data Protection Officer (DPO)'}
            </h2>
            <p>{locale === 'fr'
              ? 'Pour toute question relative à la protection de vos données personnelles, vous pouvez contacter notre DPO à l\'adresse : dpo@skal.digital'
              : 'For any questions regarding the protection of your personal data, you can contact our DPO at: dpo@skal.digital'
            }</p>
          </section>

          {/* Loi applicable */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Droit applicable' : 'Applicable Law'}
            </h2>
            <p>{locale === 'fr'
              ? 'Le présent site et ses mentions légales sont régis par le droit français. En cas de litige, les tribunaux français seront seuls compétents.'
              : 'This site and its legal notices are governed by French law. In case of dispute, French courts shall have exclusive jurisdiction.'
            }</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Legal;