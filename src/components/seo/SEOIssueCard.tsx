import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Wrench, Settings, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { SEOIssue } from "@/lib/api/seo";

interface SEOIssueCardProps {
  issue: SEOIssue;
}

export function SEOIssueCard({ issue }: SEOIssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useI18n();

  const getPriorityStyles = () => {
    switch (issue.priority) {
      case "High":
        return {
          bg: "glass-card border-destructive/30",
          icon: <AlertCircle className="h-5 w-5 text-destructive" />,
          badge: "bg-destructive/10 text-destructive",
          label: t('issue.highPriority'),
        };
      case "Medium":
        return {
          bg: "glass-card border-amber-500/30",
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
          badge: "bg-amber-500/10 text-amber-600",
          label: t('issue.mediumPriority'),
        };
      case "Low":
        return {
          bg: "glass-card border-primary/30",
          icon: <Info className="h-5 w-5 text-primary" />,
          badge: "bg-primary/10 text-primary",
          label: t('issue.lowPriority'),
        };
    }
  };

  const getFixTypeInfo = () => {
    switch (issue.fixType) {
      case "manual":
        return { icon: <Wrench className="h-3 w-3" />, label: t('issue.manual'), color: "text-orange-600" };
      case "automated":
        return { icon: <Zap className="h-3 w-3" />, label: t('issue.automated'), color: "text-emerald-600" };
      case "semi-automated":
        return { icon: <Settings className="h-3 w-3" />, label: t('issue.semiAutomated'), color: "text-primary" };
      default:
        return null;
    }
  };

  const styles = getPriorityStyles();
  const fixTypeInfo = getFixTypeInfo();

  return (
    <div className={cn("rounded-xl border p-4", styles.bg)}>
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left">
        <div className="flex items-start gap-3">
          {styles.icon}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", styles.badge)}>{styles.label}</span>
              <span className="text-xs text-muted-foreground">{issue.category}</span>
              {fixTypeInfo && (
                <span className={cn("text-xs flex items-center gap-1", fixTypeInfo.color)}>
                  {fixTypeInfo.icon}
                  {fixTypeInfo.label}
                </span>
              )}
            </div>
            <h3 className="font-medium text-foreground">{issue.issue}</h3>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
        </div>
      </button>
      {isExpanded && (
        <div className="mt-4 ml-8 space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{t('issue.whyProblem')}</p>
            <p className="text-sm text-foreground">{issue.impact}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{t('issue.howToFix')}</p>
            <p className="text-sm text-foreground">{issue.fix}</p>
          </div>
        </div>
      )}
    </div>
  );
}
