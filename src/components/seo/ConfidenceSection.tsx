import { Shield, CheckCircle2, AlertTriangle, HelpCircle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { ConfidenceIndicator } from "@/lib/api/seo";

interface ConfidenceSectionProps {
  indicators: ConfidenceIndicator[];
}

export function ConfidenceSection({ indicators }: ConfidenceSectionProps) {
  const { t } = useI18n();

  if (!indicators || indicators.length === 0) return null;

  const getLevelInfo = (level: ConfidenceIndicator['level']) => {
    switch (level) {
      case 'verified':
        return { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, label: t('confidence.verified'), color: 'text-emerald-600' };
      case 'partial':
        return { icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, label: t('confidence.partial'), color: 'text-amber-600' };
      case 'uncertain':
        return { icon: <HelpCircle className="h-4 w-4 text-destructive" />, label: t('confidence.uncertain'), color: 'text-destructive' };
      case 'not_checked':
        return { icon: <MinusCircle className="h-4 w-4 text-muted-foreground" />, label: t('confidence.notChecked'), color: 'text-muted-foreground' };
    }
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t('confidence.title')}</h2>
      </div>
      <div className="space-y-2">
        {indicators.map((ind, i) => {
          const info = getLevelInfo(ind.level);
          return (
            <div key={i} className="flex items-start gap-3 py-1.5 border-b border-border/30 last:border-0">
              {info.icon}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{ind.aspect}</span>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded-full bg-muted", info.color)}>
                    {info.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{ind.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
