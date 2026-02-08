import { SEOAnalyzer } from "@/components/seo/SEOAnalyzer";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />

        <section id="analyzer" className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <SEOAnalyzer />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
