import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { ScoreBreakdown } from "@/lib/api/seo";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface SEOScoreCardProps {
  score: number;
  breakdown?: ScoreBreakdown[];
}

export function SEOScoreCard({ score, breakdown }: SEOScoreCardProps) {
  const { t } = useI18n();

  const getScoreColor = () => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    if (score >= 40) return "text-orange-500";
    return "text-destructive";
  };

  const getScoreLabel = () => {
    if (score >= 80) return t('score.excellent');
    if (score >= 60) return t('score.good');
    if (score >= 40) return t('score.needsWork');
    return t('score.critical');
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 80) return "bg-emerald-500";
    if (pct >= 50) return "bg-amber-500";
    return "bg-destructive";
  };

  const radarData = breakdown?.map(b => ({
    category: b.category.length > 12 ? b.category.substring(0, 12) + '…' : b.category,
    fullCategory: b.category,
    score: Math.round((b.score / b.maxScore) * 100),
    fullMark: 100,
  })) || [];

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">{t('score.title')}</p>
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 327} 327`}
              className={getScoreColor()}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-bold", getScoreColor())} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>
        <p className={cn("text-sm font-semibold mt-2", getScoreColor())}>{getScoreLabel()}</p>
      </div>

      {/* Radar Chart */}
      {radarData.length > 0 && (
        <div className="mt-4 -mx-2">
          <div className="h-52 sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                  tickCount={4}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {breakdown && breakdown.length > 0 && (
        <div className="mt-3 pt-4 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            {t('score.breakdown')}
          </p>
          <div className="space-y-2.5">
            {breakdown.map((b, i) => {
              const pct = Math.round((b.score / b.maxScore) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{b.category}</span>
                    <span className="text-muted-foreground">{b.score}/{b.maxScore}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", getProgressColor(pct))}
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
