import { Download, FileCode, FileText, ShoppingCart, Code, Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { GeneratedFix } from "@/lib/api/seo";
import { cn } from "@/lib/utils";

interface GeneratedFixesProps {
  fixes: GeneratedFix[];
}

export function GeneratedFixes({ fixes }: GeneratedFixesProps) {
  if (!fixes || fixes.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileCode className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">
          Fichiers générés automatiquement ({fixes.length})
        </h2>
      </div>
      <div className="grid gap-3">
        {fixes.map((fix, index) => (
          <FixCard key={index} fix={fix} />
        ))}
      </div>
    </div>
  );
}

function FixCard({ fix }: { fix: GeneratedFix }) {
  const [showPreview, setShowPreview] = useState(false);

  const getIcon = () => {
    switch (fix.type) {
      case 'robots_txt': return <FileText className="h-4 w-4" />;
      case 'sitemap_xml': return <FileCode className="h-4 w-4" />;
      case 'meta_tags': return <Code className="h-4 w-4" />;
      case 'merchant_feed': return <ShoppingCart className="h-4 w-4" />;
      case 'structured_data': return <Code className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleDownload = () => {
    const blob = new Blob([fix.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fix.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card border rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-foreground">{fix.label}</h3>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                fix.status === 'auto_generated'
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              )}>
                {fix.status === 'auto_generated' ? '✅ Auto-généré' : '📝 À vérifier'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{fix.description}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-3 w-3 mr-1" />
            {showPreview ? 'Masquer' : 'Aperçu'}
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <Download className="h-3 w-3 mr-1" />
            {fix.filename}
          </Button>
        </div>
      </div>

      {showPreview && (
        <div className="mt-3 pt-3 border-t">
          <pre className="bg-muted rounded-lg p-3 text-xs overflow-auto max-h-64 whitespace-pre-wrap font-mono">
            {fix.content}
          </pre>
        </div>
      )}
    </div>
  );
}
