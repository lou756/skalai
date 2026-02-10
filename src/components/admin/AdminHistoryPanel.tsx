import { useState, useEffect } from "react";
import { History, ExternalLink, TrendingUp, TrendingDown, Minus, Trash2, Eye, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getHistory, getFullResult, type ScanHistoryEntry } from "@/lib/api/history";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { generatePDFReport } from "@/lib/api/pdf-export";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function AdminHistoryPanel() {
  const { t } = useI18n();
  const [entries, setEntries] = useState<ScanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [loadingResult, setLoadingResult] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    const data = await getHistory(50);
    setEntries(data);
    setLoading(false);
  };

  const handleViewReport = async (entry: ScanHistoryEntry) => {
    setLoadingResult(entry.id);
    const result = await getFullResult(entry.id);
    if (result) {
      generatePDFReport(result);
    }
    setLoadingResult(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-destructive";
  };

  const uniqueUrls = [...new Set(entries.map(e => {
    try { return new URL(e.url).hostname; } catch { return e.url; }
  }))];

  const filteredEntries = selectedUrl
    ? entries.filter(e => { try { return new URL(e.url).hostname === selectedUrl; } catch { return false; } })
    : entries;

  const chartData = selectedUrl && filteredEntries.length >= 2
    ? [...filteredEntries].reverse().map(e => ({
        date: new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: e.score,
        issues: e.issues_count,
      }))
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* URL filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={selectedUrl === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedUrl(null)}
          className="text-xs"
        >
          {t('admin.allSites')} ({entries.length})
        </Button>
        {uniqueUrls.slice(0, 10).map(url => (
          <Button
            key={url}
            variant={selectedUrl === url ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedUrl(url)}
            className="text-xs"
          >
            {url}
          </Button>
        ))}
      </div>

      {/* Trend chart */}
      {chartData && chartData.length >= 2 && (
        <div className="glass-card rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('history.trend')} — {selectedUrl}
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} name="Score" />
                <Line type="monotone" dataKey="issues" stroke="hsl(var(--destructive))" strokeWidth={1.5} strokeDasharray="4 4" name="Issues" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('admin.scanHistory')} ({filteredEntries.length})
          </span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {t('history.empty')}
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredEntries.map((entry) => {
              const hostname = (() => { try { return new URL(entry.url).hostname; } catch { return entry.url; } })();
              const date = new Date(entry.created_at).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              return (
                <div key={entry.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className={cn("text-xl font-bold w-12 text-center shrink-0", getScoreColor(entry.score))} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {entry.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{hostname}</span>
                      <a href={entry.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{date}</span>
                      <span>{entry.issues_count} issues</span>
                      <span>{entry.fixes_count} fixes</span>
                      {entry.pages_crawled && <span>{entry.pages_crawled} pages</span>}
                      {entry.scan_duration_ms && <span>{(entry.scan_duration_ms / 1000).toFixed(1)}s</span>}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-xs gap-1.5"
                    onClick={() => handleViewReport(entry)}
                    disabled={loadingResult === entry.id}
                  >
                    {loadingResult === entry.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                    PDF
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
