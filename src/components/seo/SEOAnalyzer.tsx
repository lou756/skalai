import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Search, Loader2, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { analyzeSEO, type SEOAnalysisResult } from "@/lib/api/seo";
import { saveAnalysis } from "@/lib/api/history";
import { generatePDFReport } from "@/lib/api/pdf-export";
import { SEOScoreCard } from "./SEOScoreCard";
import { SEOIssueCard } from "./SEOIssueCard";
import { SEOChecklist } from "./SEOChecklist";
import { GeneratedFixes } from "./GeneratedFixes";
import { ActionReportSection } from "./ActionReportSection";
import { LovablePromptsSection } from "./LovablePromptsSection";
import { SEODetailSections } from "./SEODetailSections";
import { ConfidenceSection } from "./ConfidenceSection";
import { ScanMetaBanner } from "./ScanMetaBanner";
import { CoreWebVitals } from "./CoreWebVitals";
import { ScanProgressAnimation } from "./ScanProgressAnimation";
import { GSCMerchantStatus } from "./GSCMerchantStatus";
import { RedirectSection, SchemaOrgSection } from "./SchemaRedirectSections";
import { motion } from "framer-motion";

export interface SEOAnalyzerHandle {
  runAnalysis: (url: string) => void;
  isLoading: boolean;
}

interface SEOAnalyzerProps {
  hideForm?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

export const SEOAnalyzer = forwardRef<SEOAnalyzerHandle, SEOAnalyzerProps>(
  function SEOAnalyzer({ hideForm, onLoadingChange }, ref) {
    const { toast } = useToast();
    const { t } = useI18n();
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SEOAnalysisResult | null>(null);

    useEffect(() => {
      onLoadingChange?.(isLoading);
    }, [isLoading, onLoadingChange]);

    const runAnalysis = async (targetUrl: string) => {
      if (!targetUrl.trim()) {
        toast({ title: t('search.urlRequired'), description: t('search.urlRequiredDesc'), variant: "destructive" });
        return;
      }

      setIsLoading(true);
      setResult(null);

      try {
        const response = await analyzeSEO(targetUrl);

        if (response.success && response.data) {
          setResult(response.data);
          await saveAnalysis(response.data);
          toast({
            title: t('search.complete'),
            description: t('search.scoreResult', { score: response.data.score, fixes: response.data.generatedFixes?.length || 0 }),
          });
        } else {
          toast({ title: t('search.error'), description: response.error || t('search.errorDesc'), variant: "destructive" });
        }
      } catch (error) {
        console.error("Error analyzing URL:", error);
        toast({ title: t('search.genericError'), description: t('search.genericErrorDesc'), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      runAnalysis,
      isLoading,
    }));

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await runAnalysis(url);
    };

    const handleRescan = () => {
      if (result?.url) {
        runAnalysis(result.url);
      }
    };

    const handleExportPDF = () => {
      if (result) {
        generatePDFReport(result);
      }
    };

    const highPriorityIssues = result?.issues.filter(i => i.priority === "High") || [];
    const mediumPriorityIssues = result?.issues.filter(i => i.priority === "Medium") || [];
    const lowPriorityIssues = result?.issues.filter(i => i.priority === "Low") || [];

    return (
      <div className="w-full max-w-4xl mx-auto">
        {!hideForm && (
          <form onSubmit={handleSubmit} className="mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="pl-10 sm:pl-12 h-12 sm:h-13 text-sm sm:text-base rounded-xl border-border/60 bg-card/80 backdrop-blur-sm focus:glow-sm"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="h-12 sm:h-13 px-6 sm:px-7 rounded-xl gradient-bg border-0 text-primary-foreground font-semibold text-sm sm:text-base">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('search.loading')}
                  </>
                ) : (
                  t('search.button')
                )}
              </Button>
            </div>
          </form>
        )}

        <ScanProgressAnimation isLoading={isLoading} />

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            {result.scanMeta && (
              <ScanMetaBanner
                scanMeta={result.scanMeta}
                rawData={result}
                onRescan={handleRescan}
                isRescanning={isLoading}
              />
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                <span>{t('results.analyzedUrl')}</span>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 break-all">
                  {result.url}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="text-xs gap-1.5 shrink-0">
                <FileText className="h-3 w-3" />
                {t('pdf.export')}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <SEOScoreCard score={result.score} breakdown={result.scoreBreakdown} />
              <SEOChecklist result={result} />
            </div>

            {result.confidence && <ConfidenceSection indicators={result.confidence} />}
            
            {/* GSC & Merchant status */}
            <GSCMerchantStatus result={result} />

            {result.actionReport && <ActionReportSection report={result.actionReport} />}
            {result.actionReport?.lovablePrompts && result.actionReport.lovablePrompts.length > 0 && (
              <LovablePromptsSection prompts={result.actionReport.lovablePrompts} />
            )}
            {result.generatedFixes && <GeneratedFixes fixes={result.generatedFixes} />}
            {result.pageSpeed && <CoreWebVitals pageSpeed={result.pageSpeed} pageSpeedDesktop={result.pageSpeedDesktop} />}

            {/* Redirect Analysis */}
            {result.redirectAnalysis && <RedirectSection redirectAnalysis={result.redirectAnalysis} />}

            {/* Schema.org Analysis */}
            {result.schemaOrgAnalysis && <SchemaOrgSection schemaOrgAnalysis={result.schemaOrgAnalysis} />}

            {result.issues.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {t('results.issues')} ({result.issues.length})
                </h2>

                {highPriorityIssues.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-medium text-destructive uppercase tracking-wide">
                      {t('results.highPriority')} ({highPriorityIssues.length})
                    </h3>
                    {highPriorityIssues.map((issue) => <SEOIssueCard key={issue.id} issue={issue} />)}
                  </div>
                )}

                {mediumPriorityIssues.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-medium text-amber-600 uppercase tracking-wide">
                      {t('results.mediumPriority')} ({mediumPriorityIssues.length})
                    </h3>
                    {mediumPriorityIssues.map((issue) => <SEOIssueCard key={issue.id} issue={issue} />)}
                  </div>
                )}

                {lowPriorityIssues.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-medium text-primary uppercase tracking-wide">
                      {t('results.lowPriority')} ({lowPriorityIssues.length})
                    </h3>
                    {lowPriorityIssues.map((issue) => <SEOIssueCard key={issue.id} issue={issue} />)}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-5 sm:p-6 text-center border-primary/20">
                <p className="text-primary font-medium text-sm sm:text-base">{t('results.noIssues')}</p>
              </div>
            )}

            <SEODetailSections result={result} />
          </motion.div>
        )}

        {!result && !isLoading && !hideForm && (
          <div className="text-center py-12 sm:py-16 text-muted-foreground">
            <div className="h-14 sm:h-16 w-14 sm:w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Search className="h-7 sm:h-8 w-7 sm:w-8 opacity-30" />
            </div>
            <p className="text-base sm:text-lg font-medium text-foreground/60">{t('empty.title')}</p>
            <p className="text-xs sm:text-sm mt-2">{t('empty.subtitle')}</p>
          </div>
        )}
      </div>
    );
  }
);
