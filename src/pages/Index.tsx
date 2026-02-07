import { SEOAnalyzer } from "@/components/seo/SEOAnalyzer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-xl font-semibold text-foreground">
              SKAL IA
            </div>
            <div className="flex items-center gap-8">
              <a 
                href="#" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Comment ça marche
              </a>
              <a 
                href="#" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                À propos
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            SKAL IA
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
            Smart Knowledge for Analytics & Launch
          </p>
          <p className="text-lg text-primary font-medium max-w-2xl mx-auto">
            Votre copilote IA pour SEO, indexation et visibilité web.
          </p>
        </section>

        {/* SEO Analyzer */}
        <SEOAnalyzer />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground text-center">
            SKAL IA — Votre copilote IA pour SEO, indexation et visibilité web.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
