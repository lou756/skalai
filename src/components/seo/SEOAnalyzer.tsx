import { useState } from "react";
import { Search, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { analyzeSEO, type SEOAnalysisResult } from "@/lib/api/seo";
import { SEOScoreCard } from "./SEOScoreCard";
import { SEOIssueCard } from "./SEOIssueCard";
import { SEOChecklist } from "./SEOChecklist";
import { GeneratedFixes } from "./GeneratedFixes";
import { ActionReportSection } from "./ActionReportSection";
import { SEODetailSections } from "./SEODetailSections";

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
          description: `Score SEO : ${response.data.score}/100 — ${response.data.generatedFixes?.length || 0} fichier(s) généré(s)`,
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
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
              {result.url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Score and Checklist */}
          <div className="grid md:grid-cols-2 gap-6">
            <SEOScoreCard score={result.score} />
            <SEOChecklist result={result} />
          </div>

          {/* Action Report */}
          {result.actionReport && <ActionReportSection report={result.actionReport} />}

          {/* Generated Fixes */}
          {result.generatedFixes && <GeneratedFixes fixes={result.generatedFixes} />}

          {/* Issues by Priority */}
          {result.issues.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Problèmes détectés ({result.issues.length})</h2>

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
              <p className="text-green-700 font-medium">🎉 Excellent ! Aucun problème SEO majeur détecté.</p>
            </div>
          )}

          {/* Detail Sections */}
          <SEODetailSections result={result} />
        </div>
      )}

      {/* Empty State */}
      {!result && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Entrez l'URL d'un site pour lancer l'analyse SEO autonome</p>
          <p className="text-sm mt-2">SKAL IA analysera, générera les corrections et produira un rapport complet.</p>
        </div>
      )}
    </div>
  );
}
