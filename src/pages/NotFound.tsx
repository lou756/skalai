import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4 max-w-md"
      >
        <div className="h-20 w-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6 glow-md">
          <Search className="h-10 w-10 text-primary-foreground opacity-80" />
        </div>

        <h1
          className="text-6xl sm:text-7xl font-bold gradient-text mb-3"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          404
        </h1>

        <p className="text-lg sm:text-xl font-semibold text-foreground mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {t('404.title')}
        </p>

        <p className="text-sm text-muted-foreground mb-8">
          {t('404.desc')}
        </p>

        <Link to="/">
          <Button className="gradient-bg border-0 text-primary-foreground gap-2 rounded-xl px-6">
            <ArrowLeft className="h-4 w-4" />
            {t('404.back')}
          </Button>
        </Link>

        <p className="text-xs text-muted-foreground/50 mt-8">
          SKAL IA — Smart Knowledge for Analytics & Launch
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
