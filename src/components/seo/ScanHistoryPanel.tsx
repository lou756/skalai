import { useState, useEffect } from "react";
import { History, ExternalLink, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getHistory, getHistoryForUrl, type ScanHistoryEntry } from "@/lib/api/history";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ScanHistoryPanelProps {
  onLoadResult?: (id: string) => void;
  currentUrl?: string;
}

export function ScanHistoryPanel({ currentUrl }: ScanHistoryPanelProps) {
  const { t } = useI18n();
  const [entries, setEntries] = useState<ScanHistoryEntry[]>([]);
  const [urlHistory, setUrlHistory] = useState<ScanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getHistory(10);
      setEntries(data);

      if (currentUrl) {
        const urlData = await getHistoryForUrl(currentUrl);
        setUrlHistory(urlData);
        setShowChart(urlData.length >= 2);
      } else {
        setUrlHistory([]);
        setShowChart(false);
      }
      setLoading(false);
    }
    load();
  }, [currentUrl]);

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{t('history.title')}</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="glass-card rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{t('history.title')}</span>
        </div>
        <p className="text-xs text-muted-foreground">{t('history.empty')}</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-destructive";
  };

  const getTrend = (entry: ScanHistoryEntry) => {
    const sameUrlEntries = entries.filter(e => e.url === entry.url);
    const myIndex = sameUrlEntries.indexOf(entry);
    if (myIndex < sameUrlEntries.length - 1) {
      const prev = sameUrlEntries[myIndex + 1];
      if (entry.score > prev.score) return <TrendingUp className="h-3 w-3 text-emerald-500" />;
      if (entry.score < prev.score) return <TrendingDown className="h-3 w-3 text-destructive" />;
      return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
    return null;
  };

  const chartData = [...urlHistory].reverse().map(e => ({
    date: new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: e.score,
    issues: e.issues_count,
  }));

  return (
    <div className="space-y-4">
      {/* Score trend chart */}
      {showChart && (
        <div className="glass-card rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {t('history.trend')}
            </span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {urlHistory.length} {t('history.scans')}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-3">
            {urlHistory.length >= 2 && (() => {
              const latest = urlHistory[0].score;
              const oldest = urlHistory[urlHistory.length - 1].score;
              const diff = latest - oldest;
              return (
                <div className="flex items-center gap-2 text-xs">
                  {diff > 0 ? (
                    <span className="flex items-center gap-1 text-emerald-500 font-medium">
                      <TrendingUp className="h-3.5 w-3.5" /> +{diff} pts
                    </span>
                  ) : diff < 0 ? (
                    <span className="flex items-center gap-1 text-destructive font-medium">
                      <TrendingDown className="h-3.5 w-3.5" /> {diff} pts
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{t('history.stable')}</span>
                  )}
                  <span className="text-muted-foreground">{t('history.since')}</span>
                </div>
              );
            })()}
          </div>

          <div className="h-36 sm:h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} activeDot={{ r: 5 }} name="Score" />
                <Line type="monotone" dataKey="issues" stroke="hsl(var(--destructive))" strokeWidth={1.5} dot={{ fill: 'hsl(var(--destructive))', r: 2 }} strokeDasharray="4 4" name="Issues" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History list */}
      <div className="glass-card rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t('history.title')}</span>
          <span className="text-[10px] text-muted-foreground ml-auto">{t('history.recent')}</span>
        </div>
        <div className="space-y-2">
          {entries.map((entry) => {
            const hostname = (() => { try { return new URL(entry.url).hostname; } catch { return entry.url; } })();
            const date = new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            return (
              <div key={entry.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className={cn("text-lg font-bold w-10 text-center shrink-0", getScoreColor(entry.score))} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {entry.score}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground truncate">{hostname}</span>
                    {getTrend(entry)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{date}</span>
                    <span>•</span>
                    <span>{entry.issues_count} issues</span>
                    <span>•</span>
                    <span>{entry.fixes_count} fixes</span>
                  </div>
                </div>
                <a href={entry.url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
