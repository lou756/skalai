import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { ScoreBreakdown } from "@/lib/api/seo";

interface SEOScoreCardProps {
  score: number;
  breakdown?: ScoreBreakdown[];
}

export function SEOScoreCard({ score, breakdown }: SEOScoreCardProps) {
  const { t } = useI18n();

  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-500";
    return "text-red-600";
  };

  const getScoreLabel = () => {
    if (score >= 80) return t('score.excellent');
    if (score >= 60) return t('score.good');
    if (score >= 40) return t('score.needsWork');
    return t('score.critical');
  };

  const getScoreBg = () => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    if (score >= 40) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className={cn("rounded-xl border-2 p-6", getScoreBg())}>
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">{t('score.title')}</p>
        <div className={cn("text-6xl font-bold", getScoreColor())}>{score}</div>
        <p className="text-sm text-muted-foreground mt-1">/100</p>
        <p className={cn("text-lg font-medium mt-2", getScoreColor())}>{getScoreLabel()}</p>
      </div>

      {breakdown && breakdown.length > 0 && (
        <div className="mt-5 pt-4 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            {t('score.breakdown')}
          </p>
          <div className="space-y-2">
            {breakdown.map((b, i) => {
              const pct = Math.round((b.score / b.maxScore) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-foreground font-medium">{b.category}</span>
                    <span className="text-muted-foreground">{b.score}/{b.maxScore}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
