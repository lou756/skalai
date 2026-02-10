import { CheckCircle2, XCircle, ExternalLink, ChevronDown, ChevronUp, Search, ShoppingCart, Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { SEOAnalysisResult } from "@/lib/api/seo";
import { cn } from "@/lib/utils";

interface GSCMerchantStatusProps {
  result: SEOAnalysisResult;
}

export function GSCMerchantStatus({ result }: GSCMerchantStatusProps) {
  const { t } = useI18n();
  const [showGSCGuide, setShowGSCGuide] = useState(false);
  const [showMerchantGuide, setShowMerchantGuide] = useState(false);
  const [showSignals, setShowSignals] = useState(false);

  const hasGSC = result.sitemap.found && result.sitemap.isValid && !result.robotsTxt.blocksGooglebot;
  
  const merchantConfidence = result.merchantAnalysis.merchantConfidence ?? 0;
  const merchantSignals = result.merchantAnalysis.merchantSignals ?? [];
  const hasMerchant = merchantConfidence >= 50;
  const isEcommerce = result.merchantAnalysis.isProductPage;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-emerald-500';
    if (confidence >= 40) return 'text-amber-500';
    return 'text-destructive';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 70) return 'bg-emerald-500/10';
    if (confidence >= 40) return 'bg-amber-500/10';
    return 'bg-destructive/10';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 70) return 'Éligibilité probable';
    if (confidence >= 40) return 'Signaux partiels';
    if (confidence > 0) return 'Peu probable';
    return 'Non détecté';
  };

  const gscSteps = [
    { step: "1", text: `Accédez à Google Search Console : https://search.google.com/search-console`, url: "https://search.google.com/search-console" },
    { step: "2", text: `Cliquez sur "Ajouter une propriété" et entrez votre domaine : ${result.url}` },
    { step: "3", text: `Vérifiez la propriété via l'une des méthodes proposées (DNS, balise HTML, fichier HTML, Google Analytics, Google Tag Manager).` },
    { step: "4", text: `Une fois vérifié, soumettez votre sitemap : ${result.sitemap.url || result.url + '/sitemap.xml'}` },
    { step: "5", text: `Attendez 24-48h pour que Google indexe votre site. Consultez le rapport de couverture pour voir les pages indexées.` },
  ];

  const merchantSteps = [
    { step: "1", text: `Accédez à Google Merchant Center : https://merchants.google.com`, url: "https://merchants.google.com" },
    { step: "2", text: `Créez un compte ou connectez-vous, puis ajoutez les informations de votre entreprise.` },
    { step: "3", text: `Vérifiez et revendiquez l'URL de votre site web.` },
    { step: "4", text: `Ajoutez vos produits via un flux de données (le fichier CSV a été généré par SKAL IA si des produits ont été détectés).` },
    { step: "5", text: `Assurez-vous que chaque produit a : nom, prix, disponibilité, image, GTIN/MPN, et données structurées JSON-LD.` },
    { step: "6", text: `Soumettez votre flux et attendez l'approbation de Google (généralement 3-5 jours ouvrables).` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* GSC Status */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            hasGSC ? "bg-emerald-500/10" : "bg-amber-500/10"
          )}>
            <Search className={cn("h-4 w-4", hasGSC ? "text-emerald-500" : "text-amber-500")} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {hasGSC ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <span className="text-sm font-medium">
                {hasGSC ? t('gsc.detected') : t('gsc.notDetected')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasGSC
                ? "Sitemap valide et site indexable — Google Search Console est probablement configuré."
                : "Aucun sitemap valide ou le site bloque Googlebot. Configurez GSC pour améliorer l'indexation."}
            </p>
          </div>
        </div>

        {!hasGSC && (
          <>
            <button
              onClick={() => setShowGSCGuide(!showGSCGuide)}
              className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              {showGSCGuide ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {t('gsc.guide')}
            </button>
            {showGSCGuide && (
              <div className="mt-3 space-y-2">
                {gscSteps.map(s => (
                  <div key={s.step} className="flex gap-2 text-xs">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                      {s.step}
                    </span>
                    <span className="text-muted-foreground">
                      {s.text}
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-primary hover:underline ml-1">
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Merchant Status - Enhanced with multi-signal detection */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            isEcommerce ? getConfidenceBg(merchantConfidence) : "bg-muted"
          )}>
            <ShoppingCart className={cn("h-4 w-4", isEcommerce ? getConfidenceColor(merchantConfidence) : "text-muted-foreground")} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {hasMerchant ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : isEcommerce ? (
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="text-sm font-medium">
                {isEcommerce ? 'Éligibilité Merchant Center' : 'Site non e-commerce'}
              </span>
              {isEcommerce && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                  getConfidenceBg(merchantConfidence),
                  getConfidenceColor(merchantConfidence)
                )}>
                  {merchantConfidence}% — {getConfidenceLabel(merchantConfidence)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEcommerce
                ? `${merchantSignals.filter(s => s.found).length}/${merchantSignals.length} signaux détectés. ${result.merchantAnalysis.productPagesFound || 0} URL(s) produit, ${result.merchantAnalysis.products.length} produit(s) analysés.`
                : "Aucun signal e-commerce détecté. Si vous vendez des produits, configurez Google Merchant Center."}
            </p>
          </div>
        </div>

        {/* Signal details */}
        {isEcommerce && merchantSignals.length > 0 && (
          <>
            <button
              onClick={() => setShowSignals(!showSignals)}
              className="flex items-center gap-1 text-xs text-primary hover:underline font-medium mb-2"
            >
              {showSignals ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Voir les {merchantSignals.length} signaux analysés
            </button>
            {showSignals && (
              <div className="space-y-1.5 mb-3">
                {merchantSignals.map((sig, i) => (
                  <div key={i} className="flex items-start gap-2 py-1 border-b border-border/20 last:border-0">
                    {sig.found ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-xs font-medium", sig.found ? "text-foreground" : "text-muted-foreground")}>
                          {sig.signal}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          (poids: {sig.weight}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">{sig.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Confidence disclaimer */}
            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-muted/50 mt-2">
              <Shield className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-tight">
                Cette analyse vérifie l'<strong>éligibilité technique</strong> au Merchant Center (balisage, structure, signaux). 
                Elle ne peut pas confirmer si un compte Merchant Center est réellement actif, car cette information n'est pas publique.
              </p>
            </div>
          </>
        )}

        {!hasMerchant && isEcommerce && (
          <>
            <button
              onClick={() => setShowMerchantGuide(!showMerchantGuide)}
              className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              {showMerchantGuide ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {t('merchant.guide')}
            </button>
            {showMerchantGuide && (
              <div className="mt-3 space-y-2">
                {merchantSteps.map(s => (
                  <div key={s.step} className="flex gap-2 text-xs">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                      {s.step}
                    </span>
                    <span className="text-muted-foreground">
                      {s.text}
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-primary hover:underline ml-1">
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}