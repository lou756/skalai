import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Wrench, Settings, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SEOIssue } from "@/lib/api/seo";

interface SEOIssueCardProps {
  issue: SEOIssue;
}

export function SEOIssueCard({ issue }: SEOIssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityStyles = () => {
    switch (issue.priority) {
      case "High":
        return {
          bg: "bg-red-50 border-red-200",
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          badge: "bg-red-100 text-red-700",
          label: "Haute priorité",
        };
      case "Medium":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
          badge: "bg-yellow-100 text-yellow-700",
          label: "Priorité moyenne",
        };
      case "Low":
        return {
          bg: "bg-blue-50 border-blue-200",
          icon: <Info className="h-5 w-5 text-blue-600" />,
          badge: "bg-blue-100 text-blue-700",
          label: "Basse priorité",
        };
    }
  };

  const getFixTypeInfo = () => {
    switch (issue.fixType) {
      case "manual":
        return {
          icon: <Wrench className="h-3 w-3" />,
          label: "Correction manuelle",
          color: "text-orange-600",
        };
      case "automated":
        return {
          icon: <Zap className="h-3 w-3" />,
          label: "Automatisable",
          color: "text-green-600",
        };
      case "semi-automated":
        return {
          icon: <Settings className="h-3 w-3" />,
          label: "Semi-automatisé",
          color: "text-blue-600",
        };
      default:
        return null;
    }
  };

  const styles = getPriorityStyles();
  const fixTypeInfo = getFixTypeInfo();

  return (
    <div className={cn("rounded-lg border p-4", styles.bg)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-3">
          {styles.icon}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", styles.badge)}>
                {styles.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {issue.category}
              </span>
              {fixTypeInfo && (
                <span className={cn("text-xs flex items-center gap-1", fixTypeInfo.color)}>
                  {fixTypeInfo.icon}
                  {fixTypeInfo.label}
                </span>
              )}
            </div>
            <h3 className="font-medium text-foreground">{issue.issue}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 ml-8 space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              ❌ Pourquoi c'est un problème
            </p>
            <p className="text-sm text-foreground">{issue.impact}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              ✅ Comment corriger
            </p>
            <p className="text-sm text-foreground">{issue.fix}</p>
          </div>
        </div>
      )}
    </div>
  );
}
