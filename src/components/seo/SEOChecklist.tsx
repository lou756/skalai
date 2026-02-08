import { Check, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { SEOAnalysisResult } from "@/lib/api/seo";

interface SEOChecklistProps {
  result: SEOAnalysisResult;
}

export function SEOChecklist({ result }: SEOChecklistProps) {
  const { t } = useI18n();

  const checks = [
    { label: t('checklist.titlePresent'), passed: !!result.meta.title },
    { label: t('checklist.descPresent'), passed: !!result.meta.description },
    { label: t('checklist.h1Unique'), passed: result.meta.hasH1 && result.meta.h1Count === 1 },
    { label: t('checklist.langDefined'), passed: !!result.meta.language },
    { label: t('checklist.canonical'), passed: !!result.meta.canonical },
    { label: t('checklist.robotsTxt'), passed: result.robotsTxt.found },
    { label: t('checklist.sitemap'), passed: result.sitemap.found },
    { label: t('checklist.sitemapValid'), passed: result.sitemap.isValid },
    { label: t('checklist.ogTags'), passed: result.meta.hasOgTags },
    { label: t('checklist.twitterCards'), passed: result.meta.hasTwitterCards },
    { label: t('checklist.viewport'), passed: result.performance.hasViewportMeta },
    { label: t('checklist.indexable'), passed: !result.meta.robots?.includes('noindex') },
    { label: t('checklist.nobrokenLinks'), passed: result.brokenLinks.length === 0 },
  ];

  const passedCount = checks.filter(c => c.passed).length;

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t('checklist.title')}</h2>
        <span className="text-sm text-muted-foreground">
          {passedCount}/{checks.length} {t('checklist.validated')}
        </span>
      </div>
      <div className="space-y-2">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
            {check.passed ? (
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-600" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-3 w-3 text-red-600" />
              </div>
            )}
            <span className={check.passed ? "text-foreground" : "text-muted-foreground"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
