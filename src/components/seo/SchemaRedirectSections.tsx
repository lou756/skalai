import { ArrowRight, AlertTriangle, CheckCircle2, RefreshCw, Code2, Blocks } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RedirectAnalysis, SchemaOrgAnalysis } from "@/lib/api/seo";

interface RedirectSectionProps {
  redirectAnalysis: RedirectAnalysis;
}

export function RedirectSection({ redirectAnalysis }: RedirectSectionProps) {
  if (redirectAnalysis.totalRedirects === 0 && redirectAnalysis.issues.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg sm:text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Redirections
          </h2>
        </div>
        <div className="glass-card rounded-xl p-4 border-emerald-500/20">
          <p className="text-sm text-emerald-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Aucune redirection détectée. L'URL est directement accessible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <RefreshCw className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg sm:text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Redirections ({redirectAnalysis.totalRedirects})
        </h2>
      </div>
      
      {redirectAnalysis.chain.length > 0 && (
        <div className="glass-card rounded-xl p-4 space-y-2">
          {redirectAnalysis.chain.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs sm:text-sm">
              <span className={cn(
                "px-1.5 py-0.5 rounded font-mono font-bold text-xs",
                r.statusCode === 301 ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
              )}>
                {r.statusCode}
              </span>
              <span className="truncate text-muted-foreground max-w-[40%]">{r.url}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="truncate text-foreground max-w-[40%]">{r.redirectsTo}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              URL finale : <span className="text-foreground font-medium">{redirectAnalysis.finalUrl}</span>
            </p>
          </div>
        </div>
      )}

      {redirectAnalysis.issues.length > 0 && (
        <div className="space-y-1.5">
          {redirectAnalysis.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-xs sm:text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-amber-700">{issue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SchemaOrgSectionProps {
  schemaOrgAnalysis: SchemaOrgAnalysis;
}

export function SchemaOrgSection({ schemaOrgAnalysis }: SchemaOrgSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Code2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg sm:text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Schema.org / Données structurées
        </h2>
        <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
          {schemaOrgAnalysis.totalFound} type(s)
        </span>
      </div>

      {schemaOrgAnalysis.types.length > 0 ? (
        <div className="glass-card rounded-xl p-4 space-y-3">
          {schemaOrgAnalysis.types.map((schema, i) => (
            <div key={i} className={cn(
              "rounded-lg border p-3",
              schema.valid ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <Blocks className={cn("h-4 w-4", schema.valid ? "text-emerald-500" : "text-amber-500")} />
                <span className="text-sm font-semibold text-foreground">{schema.type}</span>
                {schema.valid ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full ml-auto">✓ Valide</span>
                ) : (
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-full ml-auto">
                    {schema.issues.length} problème(s)
                  </span>
                )}
              </div>
              {schema.issues.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {schema.issues.map((issue, j) => (
                    <li key={j} className="text-xs text-amber-700 flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="pt-2 text-xs text-muted-foreground">
            {schemaOrgAnalysis.validCount}/{schemaOrgAnalysis.totalFound} type(s) valide(s)
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 border-amber-500/20">
          <p className="text-sm text-amber-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Aucune donnée structurée JSON-LD détectée.
          </p>
        </div>
      )}

      {schemaOrgAnalysis.recommendations.length > 0 && (
        <div className="glass-card rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Recommandations</p>
          {schemaOrgAnalysis.recommendations.map((rec, i) => (
            <p key={i} className="text-xs sm:text-sm text-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              {rec}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
