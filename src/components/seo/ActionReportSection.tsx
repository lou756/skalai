import { Zap, HandMetal, CheckCircle2, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { ActionReport } from "@/lib/api/seo";
import { cn } from "@/lib/utils";

interface ActionReportSectionProps {
  report: ActionReport;
}

export function ActionReportSection({ report }: ActionReportSectionProps) {
  const { t } = useI18n();

  if (!report) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t('report.title')}</h2>

      {report.automated.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-medium text-emerald-600 uppercase tracking-wide">
              {t('report.automated')} ({report.automated.length})
            </h3>
          </div>
          <div className="glass-card rounded-xl divide-y divide-border/30 border-emerald-500/20">
            {report.automated.map((action, i) => (
              <div key={i} className="p-3 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-foreground">{action.action}</span>
                    <span className="text-xs text-emerald-600">{action.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.manual.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <HandMetal className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-medium text-amber-600 uppercase tracking-wide">
              {t('report.manual')} ({report.manual.length})
            </h3>
          </div>
          <div className="glass-card rounded-xl divide-y divide-border/30">
            {report.manual.map((action, i) => (
              <div key={i} className="p-3 flex items-start gap-3">
                <AlertTriangle className={cn(
                  "h-4 w-4 shrink-0 mt-0.5",
                  action.priority === 'High' ? 'text-destructive' :
                  action.priority === 'Medium' ? 'text-amber-500' : 'text-primary'
                )} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-foreground">{action.action}</span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      action.priority === 'High' ? 'bg-destructive/10 text-destructive' :
                      action.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'
                    )}>
                      {action.priority === 'High' ? t('report.priorityHigh') :
                       action.priority === 'Medium' ? t('report.priorityMedium') : t('report.priorityLow')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.instructions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
