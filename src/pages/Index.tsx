const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-xl font-semibold text-foreground">Logo</div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Accueil</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">À propos</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6">
        <section className="py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-foreground mb-6">
            Bienvenue
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Votre page est prête. Commencez à construire quelque chose d'extraordinaire.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 Votre Entreprise. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
