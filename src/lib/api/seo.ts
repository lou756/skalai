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

export interface ContentAnalysis {
  wordCount: number;
  readabilityScore: number;
  keywordDensity: { keyword: string; count: number; density: number }[];
  duplicateContent: { text: string; count: number }[];
  suggestions: {
    title: string | null;
    description: string | null;
    improvements: string[];
  };
}

export interface HreflangAnalysis {
  detected: { lang: string; url: string }[];
  issues: string[];
  recommendations: string[];
}

export interface ProductData {
  name: string | null;
  price: string | null;
  currency: string | null;
  availability: string | null;
  description: string | null;
  image: string | null;
  gtin: string | null;
  mpn: string | null;
  brand: string | null;
  sku: string | null;
  condition: string | null;
  shipping: boolean;
  rating: { value: string | null; count: string | null } | null;
}

export interface MerchantAnalysis {
  isProductPage: boolean;
  products: ProductData[];
  issues: { issue: string; impact: string; fix: string; priority: 'High' | 'Medium' | 'Low' }[];
  structuredDataFound: boolean;
  feedRecommendations: string[];
}

export interface GeneratedFix {
  type: 'robots_txt' | 'sitemap_xml' | 'meta_tags' | 'merchant_feed' | 'structured_data';
  label: string;
  description: string;
  content: string;
  filename: string;
  status: 'auto_generated' | 'needs_review';
}

export interface ActionReport {
  automated: { action: string; status: string; details: string }[];
  manual: { action: string; instructions: string; priority: 'High' | 'Medium' | 'Low' }[];
}

export interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  details: string;
}

export interface ConfidenceIndicator {
  aspect: string;
  level: 'verified' | 'partial' | 'uncertain' | 'not_checked';
  detail: string;
}

export interface ScanMeta {
  scannedAt: string;
  durationMs: number;
  pagesCrawled: number;
  elementsChecked: number;
  engine: string;
  sources: string[];
}

export interface SEOAnalysisResult {
  url: string;
  score: number;
  scoreBreakdown: ScoreBreakdown[];
  confidence: ConfidenceIndicator[];
  scanMeta: ScanMeta;
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
  contentAnalysis: ContentAnalysis;
  hreflangAnalysis: HreflangAnalysis;
  merchantAnalysis: MerchantAnalysis;
  generatedFixes: GeneratedFix[];
  actionReport: ActionReport;
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
