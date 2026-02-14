import { Sparkles, Copy, Check, ShoppingCart, Search, Zap, FileText, Shield } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { LovablePrompt } from "@/lib/api/seo";
import { cn } from "@/lib/utils";

interface LovablePromptsSectionProps {
  prompts: LovablePrompt[];
}

export function LovablePromptsSection({ prompts }: LovablePromptsSectionProps) {
  const { t } = useI18n();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  if (!prompts || prompts.length === 0) return null;

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seo': return <Search className="h-3.5 w-3.5" />;
      case 'merchant': return <ShoppingCart className="h-3.5 w-3.5" />;
      case 'performance': return <Zap className="h-3.5 w-3.5" />;
      case 'content': return <FileText className="h-3.5 w-3.5" />;
      case 'security': return <Shield className="h-3.5 w-3.5" />;
      default: return <Sparkles className="h-3.5 w-3.5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'seo': return 'SEO';
      case 'merchant': return 'Merchant Center';
      case 'performance': return 'Performance';
      case 'content': return t('detail.contentAnalysis');
      case 'security': return 'Security';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'seo': return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      case 'merchant': return 'text-purple-600 bg-purple-500/10 border-purple-500/20';
      case 'performance': return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
      case 'content': return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
      case 'security': return 'text-red-600 bg-red-500/10 border-red-500/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  // Group by priority
  const highPrompts = prompts.filter(p => p.priority === 'High');
  const mediumPrompts = prompts.filter(p => p.priority === 'Medium');
  const lowPrompts = prompts.filter(p => p.priority === 'Low');
  const grouped = [...highPrompts, ...mediumPrompts, ...lowPrompts];


  const buildAllPromptsText = () => {
    let text = `Voici toutes les solutions recommandées suite à l'audit SEO :\n\n`;
    grouped.forEach((p, i) => {
      text += `${i + 1}. [${p.priority}] [${getCategoryLabel(p.category)}] ${p.title}\n`;
      text += `${p.prompt}\n\n`;
    });
    return text.trim();
  };

  const handleCopyAll = async () => {
    const text = buildAllPromptsText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t('lovable.title')}
          </h2>
          <p className="text-xs text-muted-foreground">{t('lovable.subtitle')}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className={cn(
              "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all",
              allCopied
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {allCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {allCopied ? t('lovable.copyAllCopied') : t('lovable.copyAll')}
          </button>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {prompts.length} {t('lovable.solutions')}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {grouped.map((prompt, i) => {
          const globalIndex = prompts.indexOf(prompt);
          return (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium border",
                      getCategoryColor(prompt.category)
                    )}>
                      {getCategoryIcon(prompt.category)}
                      {getCategoryLabel(prompt.category)}
                    </span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-medium",
                      prompt.priority === 'High' ? 'bg-destructive/10 text-destructive' :
                      prompt.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'
                    )}>
                      {prompt.priority === 'High' ? t('report.priorityHigh') :
                       prompt.priority === 'Medium' ? t('report.priorityMedium') : t('report.priorityLow')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(prompt.prompt, globalIndex)}
                    className={cn(
                      "shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all",
                      copiedIndex === globalIndex
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    {copiedIndex === globalIndex ? (
                      <>
                        <Check className="h-3 w-3" />
                        {t('lovable.copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        {t('lovable.copy')}
                      </>
                    )}
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{prompt.title}</h3>
                <div className="bg-muted/50 rounded-lg p-3 border border-border/30">
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{prompt.prompt}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-1.5 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-tight">
          {t('lovable.disclaimer')}
        </p>
      </div>
    </div>
  );
}