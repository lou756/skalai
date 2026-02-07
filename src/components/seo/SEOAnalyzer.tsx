import { useState } from "react";
import { Search, Loader2, ExternalLink, ClipboardList, Link2Off, FileText, Sparkles, Globe, BookOpen, TrendingUp, ShoppingCart, Package, Tag, DollarSign, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { analyzeSEO, type SEOAnalysisResult } from "@/lib/api/seo";
import { SEOScoreCard } from "./SEOScoreCard";
import { SEOIssueCard } from "./SEOIssueCard";
import { SEOChecklist } from "./SEOChecklist";
import { Progress } from "@/components/ui/progress";

export function SEOAnalyzer() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SEOAnalysisResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL requise",
        description: "Veuillez entrer l'URL du site à analyser.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await analyzeSEO(url);

      if (response.success && response.data) {
        setResult(response.data);
        toast({
          title: "Analyse terminée",
          description: `Score SEO : ${response.data.score}/100`,
        });
      } else {
        toast({
          title: "Erreur d'analyse",
          description: response.error || "Impossible d'analyser ce site.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error analyzing URL:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'analyse.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const highPriorityIssues = result?.issues.filter(i => i.priority === "High") || [];
  const mediumPriorityIssues = result?.issues.filter(i => i.priority === "Medium") || [];
  const lowPriorityIssues = result?.issues.filter(i => i.priority === "Low") || [];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Entrez l'URL de votre site (ex: example.com)"
              className="pl-10 h-12 text-base"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="h-12 px-6">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyse...
              </>
            ) : (
              "Analyser"
            )}
          </Button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
          {/* Header with URL */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Analyse de</span>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              {result.url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Score and Checklist */}
          <div className="grid md:grid-cols-2 gap-6">
            <SEOScoreCard score={result.score} />
            <SEOChecklist result={result} />
          </div>

          {/* Issues by Priority */}
          {result.issues.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                Problèmes détectés ({result.issues.length})
              </h2>

              {highPriorityIssues.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-red-600 uppercase tracking-wide">
                    Haute priorité ({highPriorityIssues.length})
                  </h3>
                  {highPriorityIssues.map((issue) => (
                    <SEOIssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              )}

              {mediumPriorityIssues.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-yellow-600 uppercase tracking-wide">
                    Priorité moyenne ({mediumPriorityIssues.length})
                  </h3>
                  {mediumPriorityIssues.map((issue) => (
                    <SEOIssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              )}

              {lowPriorityIssues.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                    Basse priorité ({lowPriorityIssues.length})
                  </h3>
                  {lowPriorityIssues.map((issue) => (
                    <SEOIssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <p className="text-green-700 font-medium">
                🎉 Excellent ! Aucun problème SEO majeur détecté.
              </p>
            </div>
          )}

          {/* Broken Links Section */}
          {result.brokenLinks && result.brokenLinks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Link2Off className="h-5 w-5 text-red-500" />
                <h2 className="text-xl font-semibold">
                  Liens cassés ({result.brokenLinks.length})
                </h2>
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
                <h2 className="text-xl font-semibold">
                  Instructions Google Search Console
                </h2>
              </div>
              <div className="bg-card border rounded-xl p-6 space-y-3">
                {result.gscInstructions.map((instruction, index) => (
                  <p key={index} className="text-sm text-foreground">
                    {instruction}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Sitemap Info */}
          {result.sitemap.found && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">
                  Informations Sitemap
                </h2>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">URL du sitemap</span>
                  <a 
                    href={result.sitemap.url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline flex items-center gap-1"
                  >
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

          {/* Content Analysis Section */}
          {result.contentAnalysis && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-semibold">
                  Analyse du contenu
                </h2>
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
                    <p className="text-xs text-yellow-600">
                      {result.contentAnalysis.duplicateContent.length} section(s) répétée(s) dans la page
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Suggestions Section */}
          {result.contentAnalysis?.suggestions && (result.contentAnalysis.suggestions.title || result.contentAnalysis.suggestions.description || result.contentAnalysis.suggestions.improvements.length > 0) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-semibold">
                  Suggestions IA
                </h2>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 space-y-4">
                {result.contentAnalysis.suggestions.title && (
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">💡 Titre suggéré</p>
                    <p className="text-foreground bg-white/50 rounded px-3 py-2 text-sm">
                      {result.contentAnalysis.suggestions.title}
                    </p>
                  </div>
                )}
                {result.contentAnalysis.suggestions.description && (
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">💡 Meta description suggérée</p>
                    <p className="text-foreground bg-white/50 rounded px-3 py-2 text-sm">
                      {result.contentAnalysis.suggestions.description}
                    </p>
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

          {/* Hreflang Analysis Section */}
          {result.hreflangAnalysis && (result.hreflangAnalysis.detected.length > 0 || result.hreflangAnalysis.issues.length > 0) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">
                  Analyse multilingue
                </h2>
              </div>
              <div className="bg-card border rounded-xl p-6 space-y-4">
                {result.hreflangAnalysis.detected.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Versions linguistiques détectées</p>
                    <div className="flex flex-wrap gap-2">
                      {result.hreflangAnalysis.detected.map((h, i) => (
                        <a
                          key={i}
                          href={h.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
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

          {/* Google Merchant Analysis Section */}
          {result.merchantAnalysis?.isProductPage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
                <h2 className="text-xl font-semibold">
                  Analyse Google Merchant Center
                </h2>
              </div>
              
              {/* Product Cards */}
              {result.merchantAnalysis.products.length > 0 && (
                <div className="space-y-3">
                  {result.merchantAnalysis.products.map((product, index) => (
                    <div key={index} className="bg-card border rounded-xl p-4">
                      <div className="flex items-start gap-4">
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name || 'Product'} 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {product.name || 'Produit sans nom'}
                          </h3>
                          {product.brand && (
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                          )}
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
                                {product.availability.includes('InStock') ? 'En stock' : 
                                 product.availability.includes('OutOfStock') ? 'Rupture' : 'Disponibilité'}
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
                        <div className="flex flex-col gap-1">
                          {product.price ? (
                            <span className="text-green-500"><Check className="h-4 w-4" /></span>
                          ) : (
                            <span className="text-red-500"><X className="h-4 w-4" /></span>
                          )}
                        </div>
                      </div>
                      
                      {/* Product Checklist */}
                      <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className={`flex items-center gap-1 ${product.price ? 'text-green-600' : 'text-red-500'}`}>
                          {product.price ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          Prix
                        </div>
                        <div className={`flex items-center gap-1 ${product.availability ? 'text-green-600' : 'text-red-500'}`}>
                          {product.availability ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          Disponibilité
                        </div>
                        <div className={`flex items-center gap-1 ${product.gtin || product.mpn ? 'text-green-600' : 'text-yellow-500'}`}>
                          {product.gtin || product.mpn ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          GTIN/MPN
                        </div>
                        <div className={`flex items-center gap-1 ${product.brand ? 'text-green-600' : 'text-yellow-500'}`}>
                          {product.brand ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          Marque
                        </div>
                        <div className={`flex items-center gap-1 ${product.image ? 'text-green-600' : 'text-red-500'}`}>
                          {product.image ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          Image
                        </div>
                        <div className={`flex items-center gap-1 ${product.description && product.description.length >= 50 ? 'text-green-600' : 'text-yellow-500'}`}>
                          {product.description && product.description.length >= 50 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          Description
                        </div>
                        <div className={`flex items-center gap-1 ${product.condition ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {product.condition ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          Condition
                        </div>
                        <div className={`flex items-center gap-1 ${product.shipping ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {product.shipping ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          Livraison
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Structured Data Status */}
              <div className={`rounded-lg p-4 ${result.merchantAnalysis.structuredDataFound ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className={`text-sm font-medium ${result.merchantAnalysis.structuredDataFound ? 'text-green-700' : 'text-yellow-700'}`}>
                  {result.merchantAnalysis.structuredDataFound 
                    ? '✅ Données structurées Product (JSON-LD) détectées' 
                    : '⚠️ Aucune donnée structurée Product détectée - Requis pour Google Shopping'}
                </p>
              </div>

              {/* Feed Recommendations */}
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
        </div>
      )}

      {/* Empty State */}
      {!result && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">
            Entrez l'URL d'un site pour analyser sa visibilité SEO
          </p>
          <p className="text-sm mt-2">
            Nous vérifierons l'indexation, la structure, le sitemap, robots.txt et plus encore.
          </p>
        </div>
      )}
    </div>
  );
}
