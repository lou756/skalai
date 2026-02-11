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
        <div className="prose prose-sm text-muted-foreground space-y-6">
          {/* Introduction */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Introduction' : 'Introduction'}
            </h2>
            <p>{locale === 'fr'
              ? 'SKAL IA respecte votre vie privée. Cette politique de confidentialité décrit les données que nous collectons, comment nous les utilisons et vos droits conformément au Règlement Général sur la Protection des Données (RGPD).'
              : 'SKAL IA respects your privacy. This privacy policy describes the data we collect, how we use it and your rights in accordance with the General Data Protection Regulation (GDPR).'
            }</p>
          </section>

          {/* Données collectées */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Données collectées' : 'Data Collected'}
            </h2>
            <p>{locale === 'fr'
              ? 'SKAL IA collecte uniquement les données suivantes :'
              : 'SKAL IA only collects the following data:'
            }</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{locale === 'fr'
                ? 'URLs soumises pour analyse (traitées en temps réel, non conservées après l\'analyse)'
                : 'URLs submitted for analysis (processed in real-time, not retained after analysis)'
              }</li>
              <li>{locale === 'fr'
                ? 'Résultats d\'audit anonymisés stockés dans l\'historique (sans données personnelles)'
                : 'Anonymized audit results stored in history (no personal data)'
              }</li>
              <li>{locale === 'fr'
                ? 'Adresse email (uniquement pour les utilisateurs créant un compte administrateur)'
                : 'Email address (only for users creating an admin account)'
              }</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Cookies' : 'Cookies'}
            </h2>
            <p>{locale === 'fr'
              ? 'SKAL IA n\'utilise aucun cookie de suivi ou publicitaire. Seuls des cookies techniques essentiels au fonctionnement du service (authentification) peuvent être utilisés.'
              : 'SKAL IA does not use any tracking or advertising cookies. Only technical cookies essential to service operation (authentication) may be used.'
            }</p>
          </section>

          {/* Finalité */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Finalité du traitement' : 'Purpose of Processing'}
            </h2>
            <p>{locale === 'fr'
              ? 'Les données sont traitées exclusivement pour fournir le service d\'audit SEO. Aucune donnée n\'est vendue, partagée avec des tiers ou utilisée à des fins publicitaires.'
              : 'Data is processed exclusively to provide the SEO audit service. No data is sold, shared with third parties or used for advertising purposes.'
            }</p>
          </section>

          {/* Conservation */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Durée de conservation' : 'Data Retention'}
            </h2>
            <p>{locale === 'fr'
              ? 'Les résultats d\'audit sont conservés dans l\'historique pendant une durée maximale de 12 mois. Les URLs analysées ne sont pas conservées après le traitement en temps réel.'
              : 'Audit results are kept in history for a maximum of 12 months. Analyzed URLs are not retained after real-time processing.'
            }</p>
          </section>

          {/* Droits */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Vos droits (RGPD)' : 'Your Rights (GDPR)'}
            </h2>
            <p>{locale === 'fr'
              ? 'Conformément au RGPD, vous disposez des droits suivants :'
              : 'Under the GDPR, you have the following rights:'
            }</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{locale === 'fr' ? 'Droit d\'accès à vos données' : 'Right to access your data'}</li>
              <li>{locale === 'fr' ? 'Droit de rectification' : 'Right to rectification'}</li>
              <li>{locale === 'fr' ? 'Droit à l\'effacement (droit à l\'oubli)' : 'Right to erasure (right to be forgotten)'}</li>
              <li>{locale === 'fr' ? 'Droit à la portabilité des données' : 'Right to data portability'}</li>
              <li>{locale === 'fr' ? 'Droit d\'opposition au traitement' : 'Right to object to processing'}</li>
            </ul>
            <p className="mt-2">{locale === 'fr'
              ? 'Pour exercer ces droits, contactez notre DPO à dpo@skal.digital.'
              : 'To exercise these rights, contact our DPO at dpo@skal.digital.'
            }</p>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Hébergement des données' : 'Data Hosting'}
            </h2>
            <p>{locale === 'fr'
              ? 'Les données sont hébergées par Lovable Technologies Inc. (San Francisco, CA, USA). Les transferts de données hors UE sont encadrés par les clauses contractuelles types de la Commission européenne.'
              : 'Data is hosted by Lovable Technologies Inc. (San Francisco, CA, USA). Data transfers outside the EU are governed by the European Commission\'s standard contractual clauses.'
            }</p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              {locale === 'fr' ? 'Contact' : 'Contact'}
            </h2>
            <p>{locale === 'fr'
              ? 'Pour toute question concernant cette politique de confidentialité : contact@skal.digital'
              : 'For any questions regarding this privacy policy: contact@skal.digital'
            }</p>
            <p>{locale === 'fr'
              ? 'Vous pouvez également adresser une réclamation à la CNIL (Commission Nationale de l\'Informatique et des Libertés) : www.cnil.fr'
              : 'You may also file a complaint with your national data protection authority (e.g. CNIL in France: www.cnil.fr).'
            }</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Privacy;