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
      <h2 className="text-xl font-semibold">{t('report.title')}</h2>

      {report.automated.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-medium text-green-700 uppercase tracking-wide">
              {t('report.automated')} ({report.automated.length})
            </h3>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl divide-y divide-green-200">
            {report.automated.map((action, i) => (
              <div key={i} className="p-3 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-green-800">{action.action}</span>
                    <span className="text-xs text-green-600">{action.status}</span>
                  </div>
                  <p className="text-xs text-green-700 mt-0.5">{action.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.manual.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <HandMetal className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-medium text-amber-700 uppercase tracking-wide">
              {t('report.manual')} ({report.manual.length})
            </h3>
          </div>
          <div className="bg-card border rounded-xl divide-y divide-border">
            {report.manual.map((action, i) => (
              <div key={i} className="p-3 flex items-start gap-3">
                <AlertTriangle className={cn(
                  "h-4 w-4 shrink-0 mt-0.5",
                  action.priority === 'High' ? 'text-red-500' :
                  action.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'
                )} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-foreground">{action.action}</span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      action.priority === 'High' ? 'bg-red-100 text-red-700' :
                      action.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
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
