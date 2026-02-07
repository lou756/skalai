import { Check, X } from "lucide-react";
import type { SEOAnalysisResult } from "@/lib/api/seo";

interface SEOChecklistProps {
  result: SEOAnalysisResult;
}

interface CheckItem {
  label: string;
  passed: boolean;
}

export function SEOChecklist({ result }: SEOChecklistProps) {
  const checks: CheckItem[] = [
    { label: "Balise title présente", passed: !!result.meta.title },
    { label: "Meta description présente", passed: !!result.meta.description },
    { label: "Balise H1 unique", passed: result.meta.hasH1 && result.meta.h1Count === 1 },
    { label: "Attribut lang défini", passed: !!result.meta.language },
    { label: "URL canonique définie", passed: !!result.meta.canonical },
    { label: "Fichier robots.txt présent", passed: result.robotsTxt.found },
    { label: "Sitemap XML trouvé", passed: result.sitemap.found },
    { label: "Structure sitemap valide", passed: result.sitemap.isValid },
    { label: "Balises Open Graph", passed: result.meta.hasOgTags },
    { label: "Twitter Cards", passed: result.meta.hasTwitterCards },
    { label: "Meta viewport (mobile)", passed: result.performance.hasViewportMeta },
    { label: "Page indexable", passed: !result.meta.robots?.includes('noindex') },
    { label: "Aucun lien cassé", passed: result.brokenLinks.length === 0 },
  ];

  const passedCount = checks.filter(c => c.passed).length;

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Checklist SEO</h2>
        <span className="text-sm text-muted-foreground">
          {passedCount}/{checks.length} validés
        </span>
      </div>
      <div className="space-y-2">
        {checks.map((check, index) => (
          <div
            key={index}
            className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
          >
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
