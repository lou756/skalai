import { Clock, Globe, Search, Cpu, Download, RefreshCw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { ScanMeta } from "@/lib/api/seo";
import { Button } from "@/components/ui/button";

interface ScanMetaBannerProps {
  scanMeta: ScanMeta;
  rawData: object;
  onRescan: () => void;
  isRescanning: boolean;
}

export function ScanMetaBanner({ scanMeta, rawData, onRescan, isRescanning }: ScanMetaBannerProps) {
  const { t } = useI18n();

  const formattedDate = new Date(scanMeta.scannedAt).toLocaleString(undefined, {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZoneName: 'short',
  });

  const durationSec = (scanMeta.durationMs / 1000).toFixed(1);

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(rawData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skalai-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { icon: Clock, label: t('scan.scannedAt'), value: formattedDate },
    { icon: Cpu, label: t('scan.duration'), value: `${durationSec}s` },
    { icon: Globe, label: t('scan.pagesCrawled'), value: String(scanMeta.pagesCrawled) },
    { icon: Search, label: t('scan.elementsChecked'), value: String(scanMeta.elementsChecked) },
  ];

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-600">{t('scan.realTimeAnalysis')}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadJSON} className="text-xs gap-1.5">
            <Download className="h-3 w-3" />
            {t('scan.downloadJSON')}
          </Button>
          <Button variant="outline" size="sm" onClick={onRescan} disabled={isRescanning} className="text-xs gap-1.5">
            <RefreshCw className={`h-3 w-3 ${isRescanning ? 'animate-spin' : ''}`} />
            {t('scan.rescan')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-tight">{stat.label}</p>
              <p className="text-sm font-semibold text-foreground truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border/30">
        <p className="text-[10px] text-muted-foreground">
          {t('scan.poweredBy')}: {scanMeta.sources.join(' • ')}
        </p>
      </div>
    </div>
  );
}
