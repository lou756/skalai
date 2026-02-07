import { useState } from "react";
import { Search, Loader2, ExternalLink, ClipboardList, Link2Off, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { analyzeSEO, type SEOAnalysisResult } from "@/lib/api/seo";
import { SEOScoreCard } from "./SEOScoreCard";
import { SEOIssueCard } from "./SEOIssueCard";
import { SEOChecklist } from "./SEOChecklist";

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
