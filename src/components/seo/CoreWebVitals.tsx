import { Gauge, Zap, Move, Image, Clock, Server, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { PageSpeedResult } from "@/lib/api/seo";

interface CoreWebVitalsProps {
  pageSpeed: PageSpeedResult;
}

function getRatingColor(rating: string | null) {
  if (rating === 'good') return 'text-emerald-500';
  if (rating === 'needs-improvement') return 'text-amber-500';
  if (rating === 'poor') return 'text-destructive';
  return 'text-muted-foreground';
}

function getRatingBg(rating: string | null) {
  if (rating === 'good') return 'bg-emerald-500/10 border-emerald-500/20';
  if (rating === 'needs-improvement') return 'bg-amber-500/10 border-amber-500/20';
  if (rating === 'poor') return 'bg-destructive/10 border-destructive/20';
  return 'bg-muted/50 border-border/50';
}

function getRatingIcon(rating: string | null) {
  if (rating === 'good') return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
  if (rating === 'needs-improvement') return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
  if (rating === 'poor') return <XCircle className="h-3.5 w-3.5 text-destructive" />;
  return null;
}

function formatMetric(value: number | null, unit: 'ms' | 's' | 'score'): string {
  if (value === null) return '—';
  if (unit === 's') return `${(value / 1000).toFixed(1)}s`;
  if (unit === 'ms') return `${Math.round(value)}ms`;
  return value.toFixed(3);
}

function getScoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground';
  if (score >= 90) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-destructive';
}

function getScoreRingColor(score: number | null) {
  if (score === null) return 'stroke-muted';
  if (score >= 90) return 'stroke-emerald-500';
  if (score >= 50) return 'stroke-amber-500';
  return 'stroke-destructive';
}

export function CoreWebVitals({ pageSpeed }: CoreWebVitalsProps) {
  const { t } = useI18n();

  if (pageSpeed.error && pageSpeed.performanceScore === null) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('psi.title')}
          </h2>
        </div>
        <div className="glass-card rounded-xl p-4 sm:p-5 border-amber-500/20">
          <p className="text-xs sm:text-sm text-amber-600">{t('psi.error')}: {pageSpeed.error}</p>
        </div>
      </div>
    );
  }

  const metrics = [
    { key: 'lcp', label: t('psi.lcp'), icon: Image, data: pageSpeed.lcp, unit: 's' as const, desc: t('psi.lcpDesc') },
    { key: 'fcp', label: t('psi.fcp'), icon: Zap, data: pageSpeed.fcp, unit: 's' as const, desc: t('psi.fcpDesc') },
    { key: 'tbt', label: t('psi.tbt'), icon: Clock, data: pageSpeed.tbt, unit: 'ms' as const, desc: t('psi.tbtDesc') },
    { key: 'cls', label: t('psi.cls'), icon: Move, data: pageSpeed.cls, unit: 'score' as const, desc: t('psi.clsDesc') },
    { key: 'si', label: t('psi.si'), icon: Gauge, data: pageSpeed.si, unit: 's' as const, desc: t('psi.siDesc') },
    { key: 'ttfb', label: t('psi.ttfb'), icon: Server, data: pageSpeed.ttfb, unit: 'ms' as const, desc: t('psi.ttfbDesc') },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2">
        <Gauge className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
        <h2 className="text-lg sm:text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {t('psi.title')}
        </h2>
        <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
          Google PSI
        </span>
      </div>

      <div className="glass-card rounded-xl p-4 sm:p-6">
        {/* Performance score */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-5 sm:mb-6">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-20 h-20 sm:w-24 sm:h-24 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                className={getScoreRingColor(pageSpeed.performanceScore)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${((pageSpeed.performanceScore || 0) / 100) * 327} 327`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-2xl sm:text-3xl font-bold", getScoreColor(pageSpeed.performanceScore))} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {pageSpeed.performanceScore ?? '—'}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm sm:text-base font-semibold text-foreground">{t('psi.performanceScore')}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('psi.mobileStrategy')}</p>
          </div>
        </div>

        {/* Core Web Vitals grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {metrics.map((m) => (
            <div key={m.key} className={cn("rounded-lg border p-2.5 sm:p-3", getRatingBg(m.data.rating))}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <m.icon className={cn("h-3.5 w-3.5", getRatingColor(m.data.rating))} />
                <span className="text-[10px] sm:text-xs font-medium text-foreground truncate">{m.label}</span>
                {getRatingIcon(m.data.rating)}
              </div>
              <p className={cn("text-base sm:text-lg font-bold", getRatingColor(m.data.rating))} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {formatMetric(m.data.value, m.unit)}
              </p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight mt-1">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Diagnostics */}
        {pageSpeed.diagnostics && pageSpeed.diagnostics.length > 0 && (
          <div className="mt-4 sm:mt-5 pt-4 border-t border-border/30">
            <p className="text-xs font-medium text-muted-foreground mb-2.5 uppercase tracking-wide">
              {t('psi.diagnostics')}
            </p>
            <div className="space-y-1.5">
              {pageSpeed.diagnostics.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                  <AlertTriangle className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", d.score !== null && d.score >= 0.5 ? 'text-amber-500' : 'text-destructive')} />
                  <span className="text-foreground">{d.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pageSpeed.fetchedAt && (
          <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border/30">
            {t('psi.source')} — {new Date(pageSpeed.fetchedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
