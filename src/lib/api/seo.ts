import { supabase } from '@/integrations/supabase/client';

export interface SEOIssue {
  id: string;
  issue: string;
  impact: string;
  fix: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  fixType: 'manual' | 'automated' | 'semi-automated';
}

export interface BrokenLink {
  url: string;
  statusCode: number | null;
  error: string | null;
}

export interface SEOMeta {
  title: string | null;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  language: string | null;
  hreflang: string[];
  hasH1: boolean;
  h1Count: number;
  hasOgTags: boolean;
  hasTwitterCards: boolean;
}

export interface SEOAnalysisResult {
  url: string;
  score: number;
  issues: SEOIssue[];
  meta: SEOMeta;
  sitemap: {
    found: boolean;
    url: string | null;
    error: string | null;
    isValid: boolean;
    urlCount: number | null;
  };
  robotsTxt: {
    found: boolean;
    content: string | null;
    blocksGooglebot: boolean;
    error: string | null;
  };
  performance: {
    hasLazyLoading: boolean;
    hasViewportMeta: boolean;
  };
  brokenLinks: BrokenLink[];
  gscInstructions: string[];
}

export type SEOResponse = {
  success: boolean;
  error?: string;
  data?: SEOAnalysisResult;
};

export async function analyzeSEO(url: string): Promise<SEOResponse> {
  const { data, error } = await supabase.functions.invoke('seo-analyze', {
    body: { url },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  
  return data;
}
