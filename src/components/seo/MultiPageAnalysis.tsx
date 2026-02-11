import { useState } from "react";
import { Globe, Languages, Loader2, ExternalLink, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { analyzeSEO, type DiscoveredLanguage, type SEOAnalysisResult } from "@/lib/api/seo";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageResult {
  url: string;
  lang: string;
  label: string;
  score: number | null;
  issues: number;
  loading: boolean;
  error?: string;
  result?: SEOAnalysisResult;
}

interface MultiPageAnalysisProps {
  languages: DiscoveredLanguage[];
  baseUrl: string;
}

export function MultiPageAnalysis({ languages, baseUrl }: MultiPageAnalysisProps) {
  const { t } = useI18n();
  const [pageResults, setPageResults] = useState<PageResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedLang, setExpandedLang] = useState<string | null>(null);

  // Filter out root/default if there are real languages
  const realLanguages = languages.filter(l => l.lang !== 'root' && l.lang !== 'default');
  const displayLanguages = realLanguages.length > 0 ? languages : languages;

  if (displayLanguages.length <= 1 && displayLanguages[0]?.lang === 'default') {
    return null; // No multi-language detected
  }

  const analyzeAllLanguages = async () => {
    setIsRunning(true);
    const targets = displayLanguages
      .filter(l => l.lang !== 'root')
      .map(l => ({
        url: l.homepage,
        lang: l.lang,
        label: l.label,
        score: null,
        issues: 0,
        loading: true,
      }));

    setPageResults(targets);

    // Run analyses in parallel (max 3 concurrent)
    const batchSize = 3;
    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize);
      const promises = batch.map(async (target) => {
        try {
          const response = await analyzeSEO(target.url);
          return {
            ...target,
            loading: false,
            score: response.data?.score ?? null,
            issues: response.data?.issues.length ?? 0,
            result: response.data ?? undefined,
            error: response.success ? undefined : response.error,
          };
        } catch (err) {
          return {
            ...target,
            loading: false,
            error: err instanceof Error ? err.message : 'Error',
          };
        }
      });

      const results = await Promise.all(promises);
      setPageResults(prev =>
        prev.map(p => {
          const updated = results.find(r => r.url === p.url);
          return updated || p;
        })
      );
    }

    setIsRunning(false);
  };

  const analyzeSinglePage = async (url: string, lang: string, label: string) => {
    const existing = pageResults.find(p => p.url === url);
    if (existing && !existing.loading && existing.score !== null) return;

    const newEntry: PageResult = { url, lang, label, score: null, issues: 0, loading: true };
    setPageResults(prev => {
      const filtered = prev.filter(p => p.url !== url);
      return [...filtered, newEntry];
    });

    try {
      const response = await analyzeSEO(url);
      setPageResults(prev =>
        prev.map(p =>
          p.url === url
            ? {
                ...p,
                loading: false,
                score: response.data?.score ?? null,
                issues: response.data?.issues.length ?? 0,
                result: response.data ?? undefined,
                error: response.success ? undefined : response.error,
              }
            : p
        )
      );
    } catch (err) {
      setPageResults(prev =>
        prev.map(p =>
          p.url === url
            ? { ...p, loading: false, error: err instanceof Error ? err.message : 'Error' }
            : p
        )
      );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('multiPage.title')}
          </h2>
        </div>
        {realLanguages.length > 0 && (
          <Button
            onClick={analyzeAllLanguages}
            disabled={isRunning}
            size="sm"
            className="gradient-bg border-0 text-primary-foreground gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('multiPage.analyzing')}
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                {t('multiPage.analyzeAll')}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Language cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayLanguages.map((lang) => {
          const result = pageResults.find(p => p.url === lang.homepage);
          const isExpanded = expandedLang === lang.lang;

          return (
            <motion.div
              key={lang.lang}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl border border-border/40 overflow-hidden"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{lang.label}</span>
                    <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      {lang.lang.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {lang.pages.length} {lang.pages.length > 1 ? 'pages' : 'page'}
                  </span>
                </div>

                {/* Score or analyze button */}
                {result?.loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">{t('multiPage.scanning')}</span>
                  </div>
                ) : result?.score !== null && result?.score !== undefined ? (
                  <div className={cn("flex items-center justify-between p-2 rounded-lg border", getScoreBg(result.score))}>
                    <span className={cn("text-2xl font-bold", getScoreColor(result.score))}>
                      {result.score}/100
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {result.issues} {t('multiPage.issues')}
                    </span>
                  </div>
                ) : result?.error ? (
                  <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg">
                    {result.error}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5"
                    onClick={() => analyzeSinglePage(lang.homepage, lang.lang, lang.label)}
                  >
                    <BarChart3 className="h-3 w-3" />
                    {t('multiPage.analyzePage')}
                  </Button>
                )}

                {/* Homepage link */}
                <a
                  href={lang.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline truncate"
                >
                  {new URL(lang.homepage).pathname || '/'}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>

                {/* Expand pages */}
                {lang.pages.length > 1 && (
                  <button
                    onClick={() => setExpandedLang(isExpanded ? null : lang.lang)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                  >
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {isExpanded ? t('multiPage.hidePages') : t('multiPage.showPages')}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/30 bg-muted/20 overflow-hidden"
                  >
                    <div className="p-3 space-y-1 max-h-48 overflow-y-auto">
                      {lang.pages.slice(0, 30).map((pageUrl, i) => (
                        <a
                          key={i}
                          href={pageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary truncate py-0.5"
                        >
                          <span className="truncate">{new URL(pageUrl).pathname}</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-50" />
                        </a>
                      ))}
                      {lang.pages.length > 30 && (
                        <p className="text-xs text-muted-foreground/60 pt-1">
                          +{lang.pages.length - 30} {t('multiPage.morePages')}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Comparative summary */}
      {pageResults.filter(p => p.score !== null).length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4 border border-primary/20"
        >
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t('multiPage.comparison')}
          </h3>
          <div className="space-y-2">
            {pageResults
              .filter(p => p.score !== null)
              .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
              .map((p) => (
                <div key={p.url} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-16 shrink-0">{p.label}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.score}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        (p.score ?? 0) >= 80 ? 'bg-emerald-500' :
                        (p.score ?? 0) >= 50 ? 'bg-amber-500' : 'bg-destructive'
                      )}
                    />
                  </div>
                  <span className={cn("text-sm font-bold w-12 text-right", getScoreColor(p.score ?? 0))}>
                    {p.score}
                  </span>
                  <span className="text-xs text-muted-foreground w-20">
                    {p.issues} {t('multiPage.issues')}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
