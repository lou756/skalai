import { CheckCircle2, XCircle, ExternalLink, ChevronDown, ChevronUp, Search, ShoppingCart, Shield, AlertTriangle, FileText } from "lucide-react";
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
  const [showGSCSignals, setShowGSCSignals] = useState(false);
  const [showMerchantGuide, setShowMerchantGuide] = useState(false);
  const [showSignals, setShowSignals] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);

  const gscDetection = result.gscDetection ?? { detected: false, confidence: 0, signals: [] };
  const gscConfidence = gscDetection.confidence;
  const hasGSC = gscDetection.detected;
  
  const merchantConfidence = result.merchantAnalysis.merchantConfidence ?? 0;
  const merchantSignals = result.merchantAnalysis.merchantSignals ?? [];
  const hasMerchant = merchantConfidence >= 50;
  const isEcommerce = result.merchantAnalysis.isProductPage;
  const compliance = result.merchantAnalysis.compliance;

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
    if (confidence >= 70) return t('gsc.eligibilityProbable');
    if (confidence >= 40) return t('gsc.partialSignals');
    if (confidence > 0) return t('gsc.unlikely');
    return t('gsc.notDetectedLabel');
  };

  const gscSteps = [
    { step: "1", text: `${t('gsc.step1')} : https://search.google.com/search-console`, url: "https://search.google.com/search-console" },
    { step: "2", text: `${t('gsc.step2')} : ${result.url}` },
    { step: "3", text: t('gsc.step3') },
    { step: "4", text: `${t('gsc.step4')} : ${result.sitemap.url || result.url + '/sitemap.xml'}` },
    { step: "5", text: t('gsc.step5') },
  ];

  const merchantSteps = [
    { step: "1", text: `${t('merchant.step1')} : https://merchants.google.com`, url: "https://merchants.google.com" },
    { step: "2", text: t('merchant.step2') },
    { step: "3", text: t('merchant.step3') },
    { step: "4", text: t('merchant.step4') },
    { step: "5", text: t('merchant.step5') },
    { step: "6", text: t('merchant.step6') },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'policy': return '📋';
      case 'product_quality': return '📸';
      case 'trust': return '🔒';
      case 'identity': return '🏢';
      case 'technical': return '⚙️';
      default: return '✓';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GSC Status */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              getConfidenceBg(gscConfidence)
            )}>
              <Search className={cn("h-4 w-4", getConfidenceColor(gscConfidence))} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {hasGSC ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : gscConfidence > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm font-medium">
                  {hasGSC ? t('gsc.detected') : 'Google Search Console'}
                </span>
                {gscConfidence > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    getConfidenceBg(gscConfidence),
                    getConfidenceColor(gscConfidence)
                  )}>
                    {gscConfidence}% — {getConfidenceLabel(gscConfidence)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {hasGSC
                  ? t('gsc.positiveSignals', { found: gscDetection.signals.filter(s => s.found).length, total: gscDetection.signals.length })
                  : t('gsc.insufficientSignals')}
              </p>
            </div>
          </div>

          {gscDetection.signals.length > 0 && (
            <>
              <button
                onClick={() => setShowGSCSignals(!showGSCSignals)}
                className="flex items-center gap-1 text-xs text-primary hover:underline font-medium mb-2"
              >
                {showGSCSignals ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {t('gsc.showSignals', { count: gscDetection.signals.length })}
              </button>
              {showGSCSignals && (
                <div className="space-y-1.5 mb-3">
                  {gscDetection.signals.map((sig, i) => (
                    <div key={i} className="flex items-start gap-2 py-1 border-b border-border/20 last:border-0">
                      {sig.found ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <span className={cn("text-xs font-medium", sig.found ? "text-foreground" : "text-muted-foreground")}>
                          {sig.signal}
                        </span>
                        <p className="text-[11px] text-muted-foreground leading-tight">{sig.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

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

        {/* Merchant Status */}
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
                  {isEcommerce ? t('merchant.eligibility') : t('merchant.notEcommerce')}
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
                  ? t('merchant.signalsDetected', {
                      found: merchantSignals.filter(s => s.found).length,
                      total: merchantSignals.length,
                      pages: result.merchantAnalysis.productPagesFound || 0,
                      products: result.merchantAnalysis.products.length,
                    })
                  : t('merchant.noSignals')}
              </p>
            </div>
          </div>

          {isEcommerce && merchantSignals.length > 0 && (
            <>
              <button
                onClick={() => setShowSignals(!showSignals)}
                className="flex items-center gap-1 text-xs text-primary hover:underline font-medium mb-2"
              >
                {showSignals ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {t('merchant.showSignals', { count: merchantSignals.length })}
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
                            ({t('merchant.weight')}: {sig.weight}%)
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-tight">{sig.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-1.5 p-2 rounded-lg bg-muted/50 mt-2">
                <Shield className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {t('merchant.technicalEligibility')}
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

      {/* Merchant Compliance Section - Full width below */}
      {isEcommerce && compliance && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              getConfidenceBg(compliance.score)
            )}>
              <FileText className={cn("h-4 w-4", getConfidenceColor(compliance.score))} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {compliance.score >= 80 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : compliance.score >= 50 ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive shrink-0" />
                )}
                <span className="text-sm font-medium">{t('merchant.complianceTitle')}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                  getConfidenceBg(compliance.score),
                  getConfidenceColor(compliance.score)
                )}>
                  {compliance.score}% — {t('merchant.complianceCriteria', { found: compliance.checks.filter(c => c.found).length, total: compliance.checks.length })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('merchant.complianceDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCompliance(!showCompliance)}
            className="flex items-center gap-1 text-xs text-primary hover:underline font-medium mb-2"
          >
            {showCompliance ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {t('merchant.showCriteria', { count: compliance.checks.length })}
          </button>

          {showCompliance && (
            <div className="space-y-1.5 mb-3">
              {compliance.checks.map((check, i) => {
                const getCheckIcon = () => {
                  if (!check.found) return <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />;
                  if (check.contentAnalyzed && check.contentValid) return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />;
                  if (check.contentAnalyzed && !check.contentValid) return <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />;
                  return <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />;
                };

                const getNameColor = () => {
                  if (!check.found) return 'text-destructive';
                  if (check.contentAnalyzed && check.contentValid) return 'text-emerald-600';
                  if (check.contentAnalyzed && !check.contentValid) return 'text-amber-600';
                  return 'text-foreground';
                };

                return (
                  <div key={i} className="flex items-start gap-2 py-1.5 border-b border-border/20 last:border-0">
                    {getCheckIcon()}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs">{getCategoryIcon(check.category)}</span>
                        <span className={cn("text-xs font-medium", getNameColor())}>
                          {check.name}
                        </span>
                        {check.contentAnalyzed && (
                          <span className={cn(
                            "text-[9px] px-1 py-0.5 rounded font-medium",
                            check.contentValid 
                              ? "bg-emerald-500/10 text-emerald-600" 
                              : "bg-amber-500/10 text-amber-600"
                          )}>
                            {check.contentValid ? t('merchant.contentValid') : t('merchant.contentInsufficient')}
                          </span>
                        )}
                        {check.found && !check.contentAnalyzed && !['product_quality', 'trust', 'identity', 'technical'].includes(check.category) && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-600 font-medium">
                            {t('merchant.notAnalyzed')}
                          </span>
                        )}
                        {check.pageUrl && (
                          <a href={check.pageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[9px] text-primary hover:underline">
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{check.detail}</p>
                      {check.contentIssues.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {check.contentIssues.map((issue, j) => (
                            <li key={j} className="text-[10px] text-amber-600 flex items-start gap-1">
                              <span className="shrink-0">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {compliance.recommendations.length > 0 && (
            <div className="space-y-1 mt-2 p-2 rounded-lg bg-muted/50">
              {compliance.recommendations.map((rec, i) => (
                <p key={i} className="text-[11px] text-muted-foreground leading-tight">{rec}</p>
              ))}
            </div>
          )}

          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-primary/5 border border-primary/10 mt-3">
            <Shield className="h-3 w-3 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-tight">
              {t('merchant.complianceDisclaimer')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}