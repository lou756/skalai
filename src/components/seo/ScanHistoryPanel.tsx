import { useState, useEffect } from "react";
import { History, ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getHistory, type ScanHistoryEntry } from "@/lib/api/history";
import { cn } from "@/lib/utils";

interface ScanHistoryPanelProps {
  onLoadResult?: (id: string) => void;
  currentUrl?: string;
}

export function ScanHistoryPanel({ currentUrl }: ScanHistoryPanelProps) {
  const { t } = useI18n();
  const [entries, setEntries] = useState<ScanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getHistory(10);
      setEntries(data);
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

  const getTrend = (entry: ScanHistoryEntry, index: number) => {
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

  return (
    <div className="glass-card rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t('history.title')}</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{t('history.recent')}</span>
      </div>
      <div className="space-y-2">
        {entries.map((entry, i) => {
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
                  {getTrend(entry, i)}
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
  );
}
