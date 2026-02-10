import { useState, useRef } from "react";
import { SEOAnalyzer, type SEOAnalyzerHandle } from "@/components/seo/SEOAnalyzer";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

const Index = () => {
  const analyzerRef = useRef<SEOAnalyzerHandle>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = (url: string) => {
    if (analyzerRef.current) {
      analyzerRef.current.runAnalysis(url);
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <HeroSection onAnalyze={handleAnalyze} isLoading={isLoading} />
        <FeaturesSection />

        <section id="analyzer" ref={resultsSectionRef} className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <SEOAnalyzer ref={analyzerRef} onLoadingChange={setIsLoading} hideForm />
        </section>
      </main>

      <SiteFooter />
      <ScrollToTop />
    </div>
  );
};

export default Index;
