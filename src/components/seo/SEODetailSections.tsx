import { ExternalLink, BookOpen, Globe, Sparkles, TrendingUp, Link2Off, ClipboardList, FileText, ShoppingCart, DollarSign, Package, Tag, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import type { SEOAnalysisResult } from "@/lib/api/seo";

interface SEODetailSectionsProps {
  result: SEOAnalysisResult;
}

export function SEODetailSections({ result }: SEODetailSectionsProps) {
  const { t } = useI18n();

  return (
    <>
      {/* Broken Links */}
      {result.brokenLinks && result.brokenLinks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link2Off className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t('detail.brokenLinks')} ({result.brokenLinks.length})</h2>
          </div>
          <div className="glass-card rounded-xl p-4 space-y-2 border-destructive/20">
            {result.brokenLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-destructive truncate max-w-md">{link.url}</span>
                <span className="text-destructive/70 font-medium">
                  {link.statusCode ? `${t('error.code')} ${link.statusCode}` : link.error || t('error.inaccessible')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GSC Instructions */}
      {result.gscInstructions && result.gscInstructions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t('detail.gscInstructions')}</h2>
          </div>
          <div className="glass-card rounded-xl p-6 space-y-3">
            {result.gscInstructions.map((instruction, index) => (
              <p key={index} className="text-sm text-foreground">{instruction}</p>
            ))}
          </div>
        </div>
      )}

      {/* Sitemap Info */}
      {result.sitemap.found && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" />
            <h2 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t('detail.sitemapInfo')}</h2>
          </div>
          <div className="glass-card rounded-xl p-4 border-emerald-500/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{t('detail.sitemapUrl')}</span>
              <a href={result.sitemap.url || '#'} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                {result.sitemap.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {result.sitemap.urlCount !== null && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-foreground">{t('detail.sitemapUrls')}</span>
                <span className="font-medium text-foreground">{result.sitemap.urlCount}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-foreground">{t('detail.sitemapValid')}</span>
              <span className={`font-medium ${result.sitemap.isValid ? 'text-emerald-500' : 'text-destructive'}`}>
                {result.sitemap.isValid ? `✓ ${t('detail.yes')}` : `✗ ${t('detail.no')}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content Analysis */}
      {result.contentAnalysis && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t('detail.contentAnalysis')}</h2>
          </div>
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('detail.wordCount')}</p>
                <p className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{result.contentAnalysis.wordCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('detail.readability')}</p>
                <div className="flex items-center gap-2">
                  <Progress value={result.contentAnalysis.readabilityScore} className="flex-1" />
                  <span className="text-sm font-medium">{result.contentAnalysis.readabilityScore}/100</span>
                </div>
              </div>
            </div>
            {result.contentAnalysis.keywordDensity.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{t('detail.topKeywords')}</p>
                <div className="flex flex-wrap gap-2">
                  {result.contentAnalysis.keywordDensity.slice(0, 6).map((kw, i) => (
                    <span key={i} className="bg-muted/50 px-2 py-1 rounded-lg text-sm">
                      {kw.keyword} <span className="text-muted-foreground">({kw.density}%)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.contentAnalysis.duplicateContent.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-600 mb-1">{t('detail.duplicateContent')}</p>
                <p className="text-xs text-amber-600/80">{result.contentAnalysis.duplicateContent.length} {t('detail.duplicateSections')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {result.contentAnalysis?.suggestions && (result.contentAnalysis.suggestions.title || result.contentAnalysis.suggestions.description || result.contentAnalysis.suggestions.improvements.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t('detail.aiSuggestions')}</h2>
          </div>
          <div className="glass-card rounded-xl p-6 space-y-4 border-amber-500/20">
            {result.contentAnalysis.suggestions.title && (
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">{t('detail.suggestedTitle')}</p>
                <p className="text-foreground bg-muted/50 rounded-lg px-3 py-2 text-sm">{result.contentAnalysis.suggestions.title}</p>
              </div>
            )}
            {result.contentAnalysis.suggestions.description && (
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">{t('detail.suggestedDesc')}</p>
                <p className="text-foreground bg-muted/50 rounded-lg px-3 py-2 text-sm">{result.contentAnalysis.suggestions.description}</p>
              </div>
            )}
            {result.contentAnalysis.suggestions.improvements.length > 0 && (
              <div>
                <p className="text-sm font-medium text-amber-600 mb-2">{t('detail.improvements')}</p>
                <ul className="space-y-1">
                  {result.contentAnalysis.suggestions.improvements.map((imp, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hreflang Analysis */}
      {result.hreflangAnalysis && (result.hreflangAnalysis.detected.length > 0 || result.hreflangAnalysis.issues.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t('detail.multilingual')}</h2>
          </div>
          <div className="glass-card rounded-xl p-6 space-y-4">
            {result.hreflangAnalysis.detected.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{t('detail.langVersions')}</p>
                <div className="flex flex-wrap gap-2">
                  {result.hreflangAnalysis.detected.map((h, i) => (
                    <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm hover:bg-primary/20 transition-colors flex items-center gap-1">
                      {h.lang}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {result.hreflangAnalysis.recommendations.length > 0 && (
              <div className="space-y-1">
                {result.hreflangAnalysis.recommendations.map((rec, i) => (
                  <p key={i} className="text-sm text-muted-foreground">{rec}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Google Merchant Analysis */}
      {result.merchantAnalysis?.isProductPage && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t('detail.merchant')}</h2>
          </div>
          
          {result.merchantAnalysis.products.length > 0 && (
            <div className="space-y-3">
              {result.merchantAnalysis.products.map((product, index) => (
                <div key={index} className="glass-card rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    {product.image && (
                      <img src={product.image} alt={product.name || 'Product'} className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{product.name || t('detail.noName')}</h3>
                      {product.brand && <p className="text-sm text-muted-foreground">{product.brand}</p>}
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        {product.price && product.currency && (
                          <span className="flex items-center gap-1 text-sm font-medium text-emerald-500">
                            <DollarSign className="h-3 w-3" />
                            {product.price} {product.currency}
                          </span>
                        )}
                        {product.availability && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Package className="h-3 w-3" />
                            {product.availability.includes('InStock') ? t('detail.inStock') : product.availability.includes('OutOfStock') ? t('detail.outOfStock') : t('detail.availability')}
                          </span>
                        )}
                        {product.gtin && (
                          <span className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-0.5 rounded-lg">
                            <Tag className="h-3 w-3" />
                            GTIN: {product.gtin}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {[
                      { ok: !!product.price, label: 'Prix' },
                      { ok: !!product.availability, label: 'Disponibilité' },
                      { ok: !!(product.gtin || product.mpn), label: 'GTIN/MPN' },
                      { ok: !!product.brand, label: 'Marque' },
                      { ok: !!product.image, label: 'Image' },
                      { ok: !!(product.description && product.description.length >= 50), label: 'Description' },
                      { ok: !!product.condition, label: 'Condition' },
                      { ok: !!product.shipping, label: 'Livraison' },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center gap-1 ${item.ok ? 'text-emerald-500' : 'text-destructive'}`}>
                        {item.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={`rounded-xl p-4 ${result.merchantAnalysis.structuredDataFound ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
            <p className={`text-sm font-medium ${result.merchantAnalysis.structuredDataFound ? 'text-emerald-600' : 'text-amber-600'}`}>
              {result.merchantAnalysis.structuredDataFound ? t('detail.structuredDataFound') : t('detail.noStructuredData')}
            </p>
          </div>

          {result.merchantAnalysis.feedRecommendations.length > 0 && (
            <div className="glass-card rounded-xl p-6 space-y-2">
              <h3 className="font-medium text-foreground mb-3">{t('detail.merchantGuide')}</h3>
              {result.merchantAnalysis.feedRecommendations.map((rec, i) => (
                <p key={i} className="text-sm text-muted-foreground">{rec}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
