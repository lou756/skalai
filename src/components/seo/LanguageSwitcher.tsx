import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-secondary rounded-full p-0.5">
      {(['fr', 'en'] as Locale[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            locale === lang
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
