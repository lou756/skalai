import { ExternalLink, BookOpen, Globe, Sparkles, TrendingUp, Link2Off, ClipboardList, FileText, ShoppingCart, DollarSign, Package, Tag, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { SEOAnalysisResult } from "@/lib/api/seo";

interface SEODetailSectionsProps {
  result: SEOAnalysisResult;
}

export function SEODetailSections({ result }: SEODetailSectionsProps) {
  return (
    <>
      {/* Broken Links */}
      {result.brokenLinks && result.brokenLinks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link2Off className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-semibold">Liens cassés ({result.brokenLinks.length})</h2>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            {result.brokenLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-red-700 truncate max-w-md">{link.url}</span>
                <span className="text-red-500 font-medium">
                  {link.statusCode ? `Erreur ${link.statusCode}` : link.error || 'Inaccessible'}
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
            <h2 className="text-xl font-semibold">Instructions Google Search Console</h2>
          </div>
          <div className="bg-card border rounded-xl p-6 space-y-3">
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
            <FileText className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Informations Sitemap</h2>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">URL du sitemap</span>
              <a href={result.sitemap.url || '#'} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline flex items-center gap-1">
                {result.sitemap.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {result.sitemap.urlCount !== null && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-green-700">URLs dans le sitemap</span>
                <span className="text-green-600 font-medium">{result.sitemap.urlCount}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-green-700">Structure valide</span>
              <span className={`font-medium ${result.sitemap.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {result.sitemap.isValid ? '✓ Oui' : '✗ Non'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content Analysis */}
      {result.contentAnalysis && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Analyse du contenu</h2>
          </div>
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre de mots</p>
                <p className="text-2xl font-bold">{result.contentAnalysis.wordCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score de lisibilité</p>
                <div className="flex items-center gap-2">
                  <Progress value={result.contentAnalysis.readabilityScore} className="flex-1" />
                  <span className="text-sm font-medium">{result.contentAnalysis.readabilityScore}/100</span>
                </div>
              </div>
            </div>
            {result.contentAnalysis.keywordDensity.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Mots-clés principaux</p>
                <div className="flex flex-wrap gap-2">
                  {result.contentAnalysis.keywordDensity.slice(0, 6).map((kw, i) => (
                    <span key={i} className="bg-muted px-2 py-1 rounded text-sm">
                      {kw.keyword} <span className="text-muted-foreground">({kw.density}%)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.contentAnalysis.duplicateContent.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-700 mb-1">⚠️ Contenu dupliqué détecté</p>
                <p className="text-xs text-yellow-600">{result.contentAnalysis.duplicateContent.length} section(s) répétée(s)</p>
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
            <h2 className="text-xl font-semibold">Suggestions IA</h2>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 space-y-4">
            {result.contentAnalysis.suggestions.title && (
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">💡 Titre suggéré</p>
                <p className="text-foreground bg-white/50 rounded px-3 py-2 text-sm">{result.contentAnalysis.suggestions.title}</p>
              </div>
            )}
            {result.contentAnalysis.suggestions.description && (
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">💡 Meta description suggérée</p>
                <p className="text-foreground bg-white/50 rounded px-3 py-2 text-sm">{result.contentAnalysis.suggestions.description}</p>
              </div>
            )}
            {result.contentAnalysis.suggestions.improvements.length > 0 && (
              <div>
                <p className="text-sm font-medium text-amber-700 mb-2">🚀 Améliorations recommandées</p>
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
            <Globe className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Analyse multilingue</h2>
          </div>
          <div className="bg-card border rounded-xl p-6 space-y-4">
            {result.hreflangAnalysis.detected.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Versions linguistiques détectées</p>
                <div className="flex flex-wrap gap-2">
                  {result.hreflangAnalysis.detected.map((h, i) => (
                    <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100 transition-colors flex items-center gap-1">
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
            <ShoppingCart className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold">Analyse Google Merchant Center</h2>
          </div>
          
          {result.merchantAnalysis.products.length > 0 && (
            <div className="space-y-3">
              {result.merchantAnalysis.products.map((product, index) => (
                <div key={index} className="bg-card border rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    {product.image && (
                      <img src={product.image} alt={product.name || 'Product'} className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{product.name || 'Produit sans nom'}</h3>
                      {product.brand && <p className="text-sm text-muted-foreground">{product.brand}</p>}
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        {product.price && product.currency && (
                          <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                            <DollarSign className="h-3 w-3" />
                            {product.price} {product.currency}
                          </span>
                        )}
                        {product.availability && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Package className="h-3 w-3" />
                            {product.availability.includes('InStock') ? 'En stock' : product.availability.includes('OutOfStock') ? 'Rupture' : 'Disponibilité'}
                          </span>
                        )}
                        {product.gtin && (
                          <span className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded">
                            <Tag className="h-3 w-3" />
                            GTIN: {product.gtin}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
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
                      <div key={i} className={`flex items-center gap-1 ${item.ok ? 'text-green-600' : 'text-red-500'}`}>
                        {item.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={`rounded-lg p-4 ${result.merchantAnalysis.structuredDataFound ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`text-sm font-medium ${result.merchantAnalysis.structuredDataFound ? 'text-green-700' : 'text-yellow-700'}`}>
              {result.merchantAnalysis.structuredDataFound 
                ? '✅ Données structurées Product (JSON-LD) détectées' 
                : '⚠️ Aucune donnée structurée Product détectée'}
            </p>
          </div>

          {result.merchantAnalysis.feedRecommendations.length > 0 && (
            <div className="bg-card border rounded-xl p-6 space-y-2">
              <h3 className="font-medium text-foreground mb-3">Guide Google Merchant Center</h3>
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
