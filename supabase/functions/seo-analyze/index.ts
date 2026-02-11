const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SEOIssue {
  id: string;
  issue: string;
  impact: string;
  fix: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  fixType: 'manual' | 'automated' | 'semi-automated';
}

interface BrokenLink {
  url: string;
  statusCode: number | null;
  error: string | null;
  status: 'broken' | 'timeout' | 'error';
}

interface ContentAnalysis {
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

interface HreflangAnalysis {
  detected: { lang: string; url: string }[];
  issues: string[];
  recommendations: string[];
}

interface ProductData {
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

interface MerchantSignal {
  signal: string;
  found: boolean;
  detail: string;
  weight: number;
}

interface MerchantComplianceCheck {
  name: string;
  found: boolean;
  pageUrl: string | null;
  contentAnalyzed: boolean;
  contentValid: boolean | null;
  contentIssues: string[];
  detail: string;
  category: 'policy' | 'product_quality' | 'trust' | 'identity' | 'technical';
}

interface MerchantCompliance {
  checks: MerchantComplianceCheck[];
  score: number; // 0-100
  missingCritical: string[];
  recommendations: string[];
}

interface MerchantAnalysis {
  isProductPage: boolean;
  products: ProductData[];
  issues: { issue: string; impact: string; fix: string; priority: 'High' | 'Medium' | 'Low' }[];
  structuredDataFound: boolean;
  feedRecommendations: string[];
  merchantSignals: MerchantSignal[];
  merchantConfidence: number; // 0-100
  productPagesFound: number;
  compliance: MerchantCompliance | null;
}

interface GeneratedFix {
  type: 'robots_txt' | 'sitemap_xml' | 'meta_tags' | 'merchant_feed' | 'structured_data';
  label: string;
  description: string;
  content: string;
  filename: string;
  status: 'auto_generated' | 'needs_review';
}

interface LovablePrompt {
  title: string;
  prompt: string;
  category: 'seo' | 'merchant' | 'performance' | 'content' | 'security';
  priority: 'High' | 'Medium' | 'Low';
}

interface ActionReport {
  automated: { action: string; status: string; details: string }[];
  manual: { action: string; instructions: string; priority: 'High' | 'Medium' | 'Low' }[];
  lovablePrompts: LovablePrompt[];
}

interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  details: string;
}

interface ConfidenceIndicator {
  aspect: string;
  level: 'verified' | 'partial' | 'uncertain' | 'not_checked';
  detail: string;
}

interface ScanMeta {
  scannedAt: string;
  durationMs: number;
  pagesCrawled: number;
  elementsChecked: number;
  engine: string;
  sources: string[];
}

interface PageSpeedResult {
  performanceScore: number | null;
  lcp: { value: number | null; rating: string | null };
  fid: { value: number | null; rating: string | null };
  cls: { value: number | null; rating: string | null };
  fcp: { value: number | null; rating: string | null };
  si: { value: number | null; rating: string | null };
  tbt: { value: number | null; rating: string | null };
  ttfb: { value: number | null; rating: string | null };
  diagnostics: { title: string; description: string; score: number | null }[];
  fetchedAt: string | null;
  error: string | null;
}

interface RedirectInfo {
  url: string;
  statusCode: number;
  redirectsTo: string;
}

interface RedirectAnalysis {
  chain: RedirectInfo[];
  finalUrl: string;
  totalRedirects: number;
  hasRedirectLoop: boolean;
  issues: string[];
}

interface SchemaOrgAnalysis {
  types: { type: string; valid: boolean; issues: string[] }[];
  totalFound: number;
  validCount: number;
  recommendations: string[];
}

interface GSCDetection {
  detected: boolean;
  confidence: number;
  signals: { signal: string; found: boolean; detail: string }[];
}

interface DiscoveredLanguage {
  lang: string;
  label: string;
  pages: string[];
  homepage: string;
}

interface SEOAnalysisResult {
  url: string;
  score: number;
  scoreBreakdown: ScoreBreakdown[];
  confidence: ConfidenceIndicator[];
  scanMeta: ScanMeta;
  issues: SEOIssue[];
  meta: {
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
  };
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
  pageSpeed: PageSpeedResult | null;
  pageSpeedDesktop: PageSpeedResult | null;
  brokenLinks: BrokenLink[];
  gscDetection: GSCDetection;
  gscInstructions: string[];
  contentAnalysis: ContentAnalysis;
  hreflangAnalysis: HreflangAnalysis;
  merchantAnalysis: MerchantAnalysis;
  generatedFixes: GeneratedFix[];
  actionReport: ActionReport;
  redirectAnalysis: RedirectAnalysis;
  schemaOrgAnalysis: SchemaOrgAnalysis;
  discoveredLanguages: DiscoveredLanguage[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Analyzing URL:', formattedUrl);
    const startTime = Date.now();

    // Scrape the page
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['html', 'markdown', 'links'],
        onlyMainContent: false,
      }),
    });

    const scrapeData = await scrapeResponse.json();
    
    if (!scrapeResponse.ok) {
      console.error('Firecrawl scrape error:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: scrapeData.error || 'Failed to scrape page' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = scrapeData.data?.html || scrapeData.html || '';
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};
    const links = scrapeData.data?.links || scrapeData.links || [];

    // Use Firecrawl Map API + HTML links + existing sitemap for complete URL discovery
    const allSiteUrls = await discoverAllUrlsEnhanced(formattedUrl, apiKey, links, html);
    console.log('Total URLs discovered:', allSiteUrls.length);

    const meta = extractMetaInfo(html, metadata);
    
    // Run parallel fetches - robots.txt now via direct fetch, PSI mobile+desktop, redirects, security
    const [robotsTxt, pageSpeed, pageSpeedDesktop, securityHeaders, redirectAnalysis] = await Promise.all([
      checkRobotsTxt(formattedUrl),
      fetchPageSpeedInsights(formattedUrl, 'mobile'),
      fetchPageSpeedInsights(formattedUrl, 'desktop'),
      checkSecurityHeaders(formattedUrl),
      analyzeRedirects(formattedUrl),
    ]);
    const sitemap = await checkSitemap(formattedUrl, robotsTxt.content);
    const performance = extractPerformanceInfo(html);
    const brokenLinks = await checkBrokenLinks(links.slice(0, 50));
    const gscDetection = detectGSC(html, sitemap, robotsTxt);
    const gscInstructions = generateGSCInstructions(formattedUrl, sitemap, robotsTxt);
    const contentAnalysis = await analyzeContent(markdown, meta, formattedUrl);
    const hreflangAnalysis = analyzeHreflang(html, meta.language, sitemap);
    const merchantAnalysis = await analyzeMerchantDataAdvanced(html, allSiteUrls, apiKey);
    // Run merchant compliance check if e-commerce detected
    if (merchantAnalysis.isProductPage) {
      merchantAnalysis.compliance = await checkMerchantCompliance(html, allSiteUrls, merchantAnalysis, apiKey);
      // Add compliance issues to merchant issues
      merchantAnalysis.compliance.missingCritical.forEach(missing => {
        merchantAnalysis.issues.push({
          issue: `Missing ${missing}`,
          impact: 'Google Merchant Center requires this page for product approval.',
          fix: `Create a dedicated ${missing} page and link it from your footer/navigation.`,
          priority: 'High',
        });
      });
      // Add content validation issues
      merchantAnalysis.compliance.checks.forEach(check => {
        if (check.contentAnalyzed && !check.contentValid && check.contentIssues.length > 0) {
          merchantAnalysis.issues.push({
            issue: `${check.name}: contenu insuffisant`,
            impact: `Google Merchant Center peut refuser vos produits. Problème(s): ${check.contentIssues.join(', ')}`,
            fix: `Mettez à jour le contenu de votre page ${check.name} pour répondre aux exigences Google.`,
            priority: 'High',
          });
        }
      });
    }
    const imageAnalysis = analyzeImages(html);
    const headingAnalysis = analyzeHeadingHierarchy(html);
    const schemaOrgAnalysis = analyzeSchemaOrg(html);
    
    const issues = generateIssues(meta, robotsTxt, sitemap, performance, formattedUrl, brokenLinks, contentAnalysis, hreflangAnalysis, merchantAnalysis, imageAnalysis, headingAnalysis, securityHeaders, pageSpeed, redirectAnalysis, schemaOrgAnalysis);
    
    // Weighted positive scoring system
    const { score, breakdown } = calculateWeightedScore(meta, robotsTxt, sitemap, performance, brokenLinks, contentAnalysis, hreflangAnalysis, merchantAnalysis, issues, pageSpeed, imageAnalysis, headingAnalysis, securityHeaders);
    
    // Confidence indicators
    const confidence = buildConfidenceIndicators(html, meta, robotsTxt, sitemap, contentAnalysis, merchantAnalysis, allSiteUrls.length);

    // Generate autonomous fixes - use ALL discovered URLs for sitemap
    const generatedFixes = generateAutonomousFixes(formattedUrl, meta, robotsTxt, sitemap, contentAnalysis, merchantAnalysis, allSiteUrls.length > 0 ? allSiteUrls : links);
    
    const actionReport = buildActionReport(issues, generatedFixes, meta, sitemap, robotsTxt, merchantAnalysis, contentAnalysis);

    // Group discovered URLs by language
    const discoveredLanguages = groupUrlsByLanguage(allSiteUrls, formattedUrl);
    console.log('Discovered languages:', discoveredLanguages.map(l => `${l.lang} (${l.pages.length} pages)`).join(', '));

    const durationMs = Date.now() - startTime;

    // Count elements checked
    const elementsChecked = 
      13 + // meta checks
      (links.slice(0, 30).length) + // links checked
      (contentAnalysis.keywordDensity.length) + // keywords analyzed
      (merchantAnalysis.products.length * 12) + // product fields per product
      (allSiteUrls.length > 0 ? 1 : 0) + // URL discovery
      (imageAnalysis.total) + // images analyzed
      (headingAnalysis.total) + // headings analyzed
      4 + // security headers
      2 + // robots.txt + sitemap
      (schemaOrgAnalysis.totalFound) + // schema.org types checked
      (redirectAnalysis.totalRedirects > 0 ? redirectAnalysis.chain.length : 1); // redirect checks

    const scanMeta: ScanMeta = {
      scannedAt: new Date().toISOString(),
      durationMs,
      pagesCrawled: allSiteUrls.length || 1,
      elementsChecked,
      engine: 'SKAL IA v4.3',
      sources: [
        'Firecrawl Web Scraping API',
        'Firecrawl Map API (URL discovery)',
        'Google PageSpeed Insights API (Mobile + Desktop)',
        'Direct HTTP requests (robots.txt, sitemap, broken links, security headers, redirects)',
        'Lovable AI Gateway (Gemini - content suggestions)',
        'Image accessibility analysis (alt text)',
        'Heading hierarchy analysis (H1-H6)',
        'Security headers audit (HTTPS, HSTS, CSP, X-Frame-Options)',
        'Redirect chain analysis (301/302)',
        'Schema.org validation (Organization, LocalBusiness, Article, FAQ, BreadcrumbList, Product, WebSite)',
        'Merchant Compliance (policy pages, trust signals, product quality)',
      ],
    };

    const result: SEOAnalysisResult = {
      url: formattedUrl,
      score,
      scoreBreakdown: breakdown,
      confidence,
      scanMeta,
      issues,
      meta,
      sitemap,
      robotsTxt,
      performance,
      pageSpeed,
      pageSpeedDesktop,
      brokenLinks,
      gscDetection,
      gscInstructions,
      contentAnalysis,
      hreflangAnalysis,
      merchantAnalysis,
      generatedFixes,
      actionReport,
      redirectAnalysis,
      schemaOrgAnalysis,
      discoveredLanguages,
    };

    console.log('Analysis complete. Score:', score, 'Duration:', durationMs, 'ms, Fixes:', generatedFixes.length, 'URLs:', allSiteUrls.length, 'Schema types:', schemaOrgAnalysis.totalFound, 'Redirects:', redirectAnalysis.totalRedirects);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze URL';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ─── Enhanced URL Discovery: Map API + HTML links + existing sitemap ──

async function discoverAllUrlsEnhanced(url: string, apiKey: string, htmlLinks: string[], html: string): Promise<string[]> {
  const urlObj = new URL(url);
  const host = urlObj.host;
  const allUrls = new Set<string>();

  // 1. Firecrawl Map API (primary source)
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        limit: 5000,
        includeSubdomains: false,
      }),
    });

    const data = await response.json();
    if (response.ok && data.success && data.links) {
      data.links.forEach((l: string) => allUrls.add(l));
      console.log('Map API URLs:', data.links.length);
    } else {
      console.error('Map API error:', data);
    }
  } catch (error) {
    console.error('Error mapping URLs:', error);
  }

  // 2. HTML links from scraped page (fallback / complement)
  if (htmlLinks && htmlLinks.length > 0) {
    htmlLinks.forEach(link => {
      try {
        const linkUrl = new URL(link, url);
        if (linkUrl.host === host) {
          allUrls.add(linkUrl.href.split('#')[0].split('?')[0]);
        }
      } catch { /* skip invalid */ }
    });
    console.log('After HTML links:', allUrls.size);
  }

  // 3. Extract links from <a href> in raw HTML
  const hrefRegex = /href=["'](\/[^"'#?]*|https?:\/\/[^"'#?]*)/gi;
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    try {
      const linkUrl = new URL(match[1], url);
      if (linkUrl.host === host && !linkUrl.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|pdf|zip)$/i)) {
        allUrls.add(linkUrl.href.split('#')[0].split('?')[0]);
      }
    } catch { /* skip */ }
  }
  console.log('After HTML href extraction:', allUrls.size);

  // 4. Try to parse the site's existing sitemap.xml for additional URLs
  try {
    const sitemapUrl = `${urlObj.protocol}//${host}/sitemap.xml`;
    const sitemapResp = await fetch(sitemapUrl, {
      headers: { 'User-Agent': 'SKAL-SEO-Analyzer/4.3' },
      redirect: 'follow',
    });
    if (sitemapResp.ok) {
      const sitemapText = await sitemapResp.text();
      const locRegex = /<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/gi;
      let locMatch;
      while ((locMatch = locRegex.exec(sitemapText)) !== null) {
        try {
          const locUrl = new URL(locMatch[1].trim());
          if (locUrl.host === host) {
            allUrls.add(locUrl.href);
          }
        } catch { /* skip */ }
      }
      console.log('After existing sitemap parsing:', allUrls.size);
    }
  } catch (error) {
    console.log('Could not fetch existing sitemap:', error);
  }

  // Filter: only valid HTTP(S) URLs, no anchors, clean
  const result = [...allUrls]
    .filter(u => u.startsWith('http'))
    .sort((a, b) => {
      const depthA = a.replace(/^https?:\/\/[^/]+/, '').split('/').filter(Boolean).length;
      const depthB = b.replace(/^https?:\/\/[^/]+/, '').split('/').filter(Boolean).length;
      return depthA - depthB;
    });

  return result;
}

// ─── Group URLs by Language ──────────────────────────────────────────

const LANG_LABELS: Record<string, string> = {
  en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch', it: 'Italiano',
  pt: 'Português', nl: 'Nederlands', ru: 'Русский', ja: '日本語', zh: '中文',
  ko: '한국어', ar: 'العربية', tr: 'Türkçe', pl: 'Polski', sv: 'Svenska',
  da: 'Dansk', fi: 'Suomi', nb: 'Norsk', cs: 'Čeština', ro: 'Română',
  el: 'Ελληνικά', he: 'עברית', th: 'ไทย', vi: 'Tiếng Việt', uk: 'Українська',
  hu: 'Magyar', bg: 'Български', hr: 'Hrvatski', sk: 'Slovenčina', sl: 'Slovenščina',
  ca: 'Català', eu: 'Euskara', gl: 'Galego',
};

function groupUrlsByLanguage(urls: string[], baseUrl: string): DiscoveredLanguage[] {
  const urlObj = new URL(baseUrl);
  const basePath = urlObj.pathname.replace(/\/$/, '');
  
  // Common language URL patterns: /en/, /fr/, /en-us/, /fr-fr/
  const langPrefixRegex = /^\/([a-z]{2}(?:-[a-z]{2})?)(?:\/|$)/i;
  
  const langGroups: Record<string, string[]> = {};
  const noLangPages: string[] = [];
  
  for (const u of urls) {
    try {
      const parsed = new URL(u);
      const path = parsed.pathname;
      const match = path.match(langPrefixRegex);
      
      if (match) {
        const lang = match[1].toLowerCase().split('-')[0]; // normalize en-us -> en
        if (!langGroups[lang]) langGroups[lang] = [];
        langGroups[lang].push(u);
      } else {
        noLangPages.push(u);
      }
    } catch { /* skip */ }
  }
  
  const results: DiscoveredLanguage[] = [];
  
  // Add language groups that have at least 2 pages (to filter out false positives)
  for (const [lang, pages] of Object.entries(langGroups)) {
    // Find the homepage for this language version
    const sortedPages = pages.sort((a, b) => a.length - b.length);
    const homepage = sortedPages[0]; // shortest URL is likely the homepage
    
    results.push({
      lang,
      label: LANG_LABELS[lang] || lang.toUpperCase(),
      pages: sortedPages,
      homepage,
    });
  }
  
  // If no language prefixes found, add the root as default
  if (results.length === 0 && noLangPages.length > 0) {
    results.push({
      lang: 'default',
      label: 'Default',
      pages: noLangPages,
      homepage: baseUrl,
    });
  } else if (noLangPages.length > 0) {
    // Add root pages as "default" group
    results.push({
      lang: 'root',
      label: 'Root / Default',
      pages: noLangPages,
      homepage: baseUrl,
    });
  }
  
  // Sort by page count descending
  results.sort((a, b) => b.pages.length - a.pages.length);
  
  return results;
}

// ─── Redirect Chain Analysis ─────────────────────────────────────────

async function analyzeRedirects(url: string): Promise<RedirectAnalysis> {
  const chain: RedirectInfo[] = [];
  const visited = new Set<string>();
  let currentUrl = url;
  let hasRedirectLoop = false;
  const issues: string[] = [];

  try {
    for (let i = 0; i < 10; i++) {
      if (visited.has(currentUrl)) {
        hasRedirectLoop = true;
        issues.push(`Redirect loop detected at ${currentUrl}`);
        break;
      }
      visited.add(currentUrl);

      const response = await fetch(currentUrl, {
        method: 'HEAD',
        redirect: 'manual',
        signal: AbortSignal.timeout(8000),
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) break;

        const resolvedUrl = location.startsWith('http') ? location : new URL(location, currentUrl).href;
        
        chain.push({
          url: currentUrl,
          statusCode: response.status,
          redirectsTo: resolvedUrl,
        });

        currentUrl = resolvedUrl;
      } else {
        break;
      }
    }

    // Analyze chain issues
    if (chain.length > 2) {
      issues.push(`Long redirect chain (${chain.length} redirects). This slows crawling and wastes crawl budget.`);
    }

    const has302 = chain.some(r => r.statusCode === 302);
    if (has302) {
      issues.push('Temporary redirect (302) detected. Use 301 for permanent redirects to pass full SEO value.');
    }

    // Check HTTP→HTTPS redirect
    if (url.startsWith('http://')) {
      const httpsVersion = url.replace('http://', 'https://');
      const hasHttpsRedirect = chain.some(r => r.redirectsTo.startsWith('https://'));
      if (!hasHttpsRedirect) {
        issues.push('No HTTP to HTTPS redirect detected. This is critical for security and SEO.');
      }
    }

    // Check www vs non-www consistency
    const urlObj = new URL(url);
    const isWww = urlObj.hostname.startsWith('www.');
    if (chain.length > 0) {
      const finalHost = new URL(currentUrl).hostname;
      const finalIsWww = finalHost.startsWith('www.');
      if (isWww !== finalIsWww) {
        // This is fine, just note it
      }
    }

  } catch (error) {
    console.error('Error analyzing redirects:', error);
    issues.push('Could not fully analyze redirect chain.');
  }

  return {
    chain,
    finalUrl: currentUrl,
    totalRedirects: chain.length,
    hasRedirectLoop,
    issues,
  };
}

// ─── Extended Schema.org Validation ──────────────────────────────────

function analyzeSchemaOrg(html: string): SchemaOrgAnalysis {
  const types: SchemaOrgAnalysis['types'] = [];
  const recommendations: string[] = [];

  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  const allSchemas: { type: string; data: Record<string, unknown> }[] = [];

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(match[1]);
      const items = Array.isArray(jsonData) ? jsonData : jsonData['@graph'] ? jsonData['@graph'] : [jsonData];
      
      for (const item of items) {
        const itemType = item['@type'];
        if (!itemType) continue;
        const typeStr = Array.isArray(itemType) ? itemType.join(', ') : itemType;
        allSchemas.push({ type: typeStr, data: item });
      }
    } catch (e) {
      types.push({ type: 'Invalid JSON-LD', valid: false, issues: ['JSON-LD parsing error: malformed JSON'] });
    }
  }

  // Validate each schema type
  const validatorMap: Record<string, (data: Record<string, unknown>) => string[]> = {
    'Organization': validateOrganization,
    'LocalBusiness': validateLocalBusiness,
    'Article': validateArticle,
    'NewsArticle': validateArticle,
    'BlogPosting': validateArticle,
    'FAQPage': validateFAQ,
    'BreadcrumbList': validateBreadcrumb,
    'Product': validateProduct,
    'WebSite': validateWebSite,
    'WebPage': validateWebPage,
  };

  for (const schema of allSchemas) {
    const schemaTypes = schema.type.split(', ');
    for (const sType of schemaTypes) {
      const validator = validatorMap[sType];
      if (validator) {
        const issues = validator(schema.data);
        types.push({ type: sType, valid: issues.length === 0, issues });
      } else {
        types.push({ type: sType, valid: true, issues: [] });
      }
    }
  }

  // Check for missing recommended schemas
  const foundTypes = new Set(allSchemas.map(s => s.type));
  
  if (!foundTypes.has('WebSite') && !allSchemas.some(s => s.type.includes('WebSite'))) {
    recommendations.push('Add WebSite schema with SearchAction for sitelinks search box in Google.');
  }
  
  const hasOrgOrBiz = allSchemas.some(s => s.type.includes('Organization') || s.type.includes('LocalBusiness'));
  if (!hasOrgOrBiz) {
    recommendations.push('Add Organization or LocalBusiness schema for Knowledge Panel eligibility.');
  }

  // Check for BreadcrumbList based on URL depth
  const hasBreadcrumb = allSchemas.some(s => s.type.includes('BreadcrumbList'));
  if (!hasBreadcrumb) {
    recommendations.push('Add BreadcrumbList schema for enhanced breadcrumb display in search results.');
  }

  // Check microdata and RDFa as well
  const hasMicrodata = /itemscope\s+itemtype=/i.test(html);
  if (hasMicrodata && allSchemas.length === 0) {
    recommendations.push('Microdata detected but no JSON-LD found. Consider migrating to JSON-LD for better maintainability.');
  }

  const validCount = types.filter(t => t.valid).length;

  return {
    types,
    totalFound: types.length,
    validCount,
    recommendations,
  };
}

function validateOrganization(data: Record<string, unknown>): string[] {
  const issues: string[] = [];
  if (!data.name) issues.push('Missing "name" (required)');
  if (!data.url) issues.push('Missing "url" (recommended)');
  if (!data.logo) issues.push('Missing "logo" (recommended for Knowledge Panel)');
  if (!data.contactPoint && !data.telephone) issues.push('Missing "contactPoint" (recommended)');
  if (!data.sameAs) issues.push('Missing "sameAs" (social profiles, recommended)');
  return issues;
}

function validateLocalBusiness(data: Record<string, unknown>): string[] {
  const issues = validateOrganization(data);
  if (!data.address) issues.push('Missing "address" (required for LocalBusiness)');
  if (!data.geo) issues.push('Missing "geo" coordinates (recommended for Google Maps)');
  if (!data.openingHours && !data.openingHoursSpecification) issues.push('Missing "openingHours" (recommended)');
  if (!data.priceRange) issues.push('Missing "priceRange" (recommended)');
  return issues;
}

function validateArticle(data: Record<string, unknown>): string[] {
  const issues: string[] = [];
  if (!data.headline) issues.push('Missing "headline" (required)');
  if (!data.author) issues.push('Missing "author" (required)');
  if (!data.datePublished) issues.push('Missing "datePublished" (required)');
  if (!data.image) issues.push('Missing "image" (required for rich results)');
  if (!data.publisher) issues.push('Missing "publisher" (required)');
  if (!data.dateModified) issues.push('Missing "dateModified" (recommended)');
  if (!data.description) issues.push('Missing "description" (recommended)');
  if (data.headline && typeof data.headline === 'string' && data.headline.length > 110) {
    issues.push(`"headline" too long (${data.headline.length} chars, max 110)`);
  }
  return issues;
}

function validateFAQ(data: Record<string, unknown>): string[] {
  const issues: string[] = [];
  const mainEntity = data.mainEntity as unknown[];
  if (!mainEntity || !Array.isArray(mainEntity) || mainEntity.length === 0) {
    issues.push('Missing "mainEntity" array with Question items');
    return issues;
  }
  for (let i = 0; i < Math.min(mainEntity.length, 5); i++) {
    const q = mainEntity[i] as Record<string, unknown>;
    if (!q.name && !q.text) issues.push(`Q${i + 1}: Missing question text ("name")`);
    const answer = q.acceptedAnswer as Record<string, unknown>;
    if (!answer?.text) issues.push(`Q${i + 1}: Missing answer text ("acceptedAnswer.text")`);
  }
  return issues;
}

function validateBreadcrumb(data: Record<string, unknown>): string[] {
  const issues: string[] = [];
  const items = data.itemListElement as unknown[];
  if (!items || !Array.isArray(items) || items.length === 0) {
    issues.push('Missing "itemListElement" array');
    return issues;
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i] as Record<string, unknown>;
    if (!item.name && !(item.item as Record<string, unknown>)?.name) {
      issues.push(`Breadcrumb item ${i + 1}: Missing "name"`);
    }
    if (item.position === undefined) {
      issues.push(`Breadcrumb item ${i + 1}: Missing "position"`);
    }
  }
  return issues;
}

function validateProduct(data: Record<string, unknown>): string[] {
  const issues: string[] = [];
  if (!data.name) issues.push('Missing "name" (required)');
  if (!data.image) issues.push('Missing "image" (required)');
  if (!data.offers) issues.push('Missing "offers" (required for price display)');
  else {
    const offers = (Array.isArray(data.offers) ? data.offers[0] : data.offers) as Record<string, unknown>;
    if (!offers?.price) issues.push('Missing "offers.price" (required)');
    if (!offers?.priceCurrency) issues.push('Missing "offers.priceCurrency" (required)');
    if (!offers?.availability) issues.push('Missing "offers.availability" (required)');
  }
  if (!data.description) issues.push('Missing "description" (recommended)');
  if (!data.brand) issues.push('Missing "brand" (recommended)');
  if (!data.sku && !data.gtin && !data.gtin13 && !data.mpn) {
    issues.push('Missing product identifier (sku, gtin, or mpn recommended)');
  }
  if (!data.aggregateRating && !data.review) {
    issues.push('Missing "aggregateRating" or "review" (recommended for star display)');
  }
  return issues;
}

function validateWebSite(data: Record<string, unknown>): string[] {
  const issues: string[] = [];
  if (!data.name) issues.push('Missing "name" (required)');
  if (!data.url) issues.push('Missing "url" (required)');
  if (!data.potentialAction) issues.push('Missing "potentialAction" (recommended for sitelinks search)');
  return issues;
}

function validateWebPage(data: Record<string, unknown>): string[] {
  const issues: string[] = [];
  if (!data.name && !data.headline) issues.push('Missing "name" or "headline"');
  if (!data.description) issues.push('Missing "description" (recommended)');
  return issues;
}

// ─── Weighted Positive Scoring ───────────────────────────────────────

function calculateWeightedScore(
  meta: ReturnType<typeof extractMetaInfo>,
  robotsTxt: Awaited<ReturnType<typeof checkRobotsTxt>>,
  sitemap: Awaited<ReturnType<typeof checkSitemap>>,
  performance: ReturnType<typeof extractPerformanceInfo>,
  brokenLinks: BrokenLink[],
  contentAnalysis: ContentAnalysis,
  hreflangAnalysis: HreflangAnalysis,
  merchantAnalysis: MerchantAnalysis,
  issues: SEOIssue[],
  pageSpeed: PageSpeedResult,
  imageAnalysis: { total: number; withoutAlt: number; withoutAlt_list: string[] },
  headingAnalysis: { total: number; hierarchy: string[]; issues: string[] },
  securityHeaders: { https: boolean; hsts: boolean; xFrameOptions: boolean; csp: boolean; xContentType: boolean }
): { score: number; breakdown: ScoreBreakdown[] } {
  const breakdown: ScoreBreakdown[] = [];

  // 1. Meta Tags (20 points max)
  let metaScore = 0;
  const metaMax = 20;
  if (meta.title) {
    metaScore += meta.title.length <= 60 ? 8 : 5;
  }
  if (meta.description) {
    metaScore += meta.description.length <= 160 && meta.description.length >= 50 ? 7 : 4;
  }
  if (meta.canonical) metaScore += 3;
  if (meta.language) metaScore += 2;
  breakdown.push({
    category: 'Meta Tags',
    score: Math.min(metaScore, metaMax),
    maxScore: metaMax,
    details: `Title: ${meta.title ? '✓' : '✗'} | Description: ${meta.description ? '✓' : '✗'} | Canonical: ${meta.canonical ? '✓' : '✗'} | Lang: ${meta.language ? '✓' : '✗'}`,
  });

  // 2. Content Structure (15 points max)
  let structureScore = 0;
  const structureMax = 15;
  if (meta.hasH1 && meta.h1Count === 1) structureScore += 6;
  else if (meta.hasH1) structureScore += 3;
  if (contentAnalysis.wordCount >= 300) structureScore += 4;
  else if (contentAnalysis.wordCount >= 100) structureScore += 2;
  if (contentAnalysis.readabilityScore >= 60) structureScore += 3;
  else if (contentAnalysis.readabilityScore >= 40) structureScore += 1;
  if (contentAnalysis.duplicateContent.length === 0) structureScore += 2;
  breakdown.push({
    category: 'Content & Structure',
    score: Math.min(structureScore, structureMax),
    maxScore: structureMax,
    details: `H1: ${meta.hasH1 ? (meta.h1Count === 1 ? '✓ unique' : `⚠ ${meta.h1Count}`) : '✗'} | Words: ${contentAnalysis.wordCount} | Readability: ${contentAnalysis.readabilityScore}/100`,
  });

  // 3. Indexability & Crawling (20 points max)
  let indexScore = 0;
  const indexMax = 20;
  if (robotsTxt.found && !robotsTxt.blocksGooglebot) indexScore += 6;
  else if (robotsTxt.found) indexScore += 2;
  // No robots.txt = 0 points (not a bonus)
  if (sitemap.found && sitemap.isValid) indexScore += 6;
  else if (sitemap.found) indexScore += 3;
  // Explicitly check for noindex - only award if robots meta actually exists and allows indexing
  if (meta.robots) {
    if (!meta.robots.includes('noindex')) indexScore += 5;
    if (!meta.robots.includes('nofollow')) indexScore += 3;
  } else {
    // No robots meta tag at all = neutral (3 pts instead of 8)
    indexScore += 3;
  }
  breakdown.push({
    category: 'Indexability',
    score: Math.min(indexScore, indexMax),
    maxScore: indexMax,
    details: `robots.txt: ${robotsTxt.found ? (robotsTxt.blocksGooglebot ? '⚠ blocks' : '✓') : '✗'} | Sitemap: ${sitemap.found ? (sitemap.isValid ? '✓ valid' : '⚠ invalid') : '✗'} | Indexable: ${!meta.robots?.includes('noindex') ? '✓' : '✗'}`,
  });

  // 4. Social & Sharing (10 points max)
  let socialScore = 0;
  const socialMax = 10;
  if (meta.hasOgTags) socialScore += 5;
  if (meta.hasTwitterCards) socialScore += 5;
  breakdown.push({
    category: 'Social & Sharing',
    score: Math.min(socialScore, socialMax),
    maxScore: socialMax,
    details: `Open Graph: ${meta.hasOgTags ? '✓' : '✗'} | Twitter Cards: ${meta.hasTwitterCards ? '✓' : '✗'}`,
  });

  // 5. Mobile & Performance (15 points max) - includes PageSpeed
  let perfScore = 0;
  const perfMax = 15;
  if (performance.hasViewportMeta) perfScore += 4;
  if (performance.hasLazyLoading) perfScore += 2;
  if (pageSpeed.performanceScore !== null) {
    if (pageSpeed.performanceScore >= 90) perfScore += 9;
    else if (pageSpeed.performanceScore >= 50) perfScore += 5;
    else if (pageSpeed.performanceScore >= 25) perfScore += 2;
  }
  // No PageSpeed data = 0 bonus (not 4 by default)
  const psiLabel = pageSpeed.performanceScore !== null ? `PSI: ${pageSpeed.performanceScore}/100` : 'PSI: N/A';
  breakdown.push({
    category: 'Mobile & Performance',
    score: Math.min(perfScore, perfMax),
    maxScore: perfMax,
    details: `Viewport: ${performance.hasViewportMeta ? '✓' : '✗'} | Lazy loading: ${performance.hasLazyLoading ? '✓' : '✗'} | ${psiLabel}`,
  });

  // 6. Links Health (8 points max) - penalize empty sites
  let linksScore = 0;
  const linksMax = 8;
  if (brokenLinks.length === 0 && contentAnalysis.wordCount > 50) {
    // Only award full points if there's actual content and no broken links
    linksScore = 8;
  } else if (brokenLinks.length === 0 && contentAnalysis.wordCount > 0) {
    linksScore = 4; // Some content, no broken links
  } else if (brokenLinks.length > 0) {
    linksScore = Math.max(0, 6 - brokenLinks.length * 2);
  }
  // Empty/minimal site = 0 points
  breakdown.push({
    category: 'Links Health',
    score: Math.min(linksScore, linksMax),
    maxScore: linksMax,
    details: contentAnalysis.wordCount < 10 ? 'Insufficient content to evaluate links' : brokenLinks.length === 0 ? `No broken links detected` : `${brokenLinks.length} broken link(s) found`,
  });

  // 7. Internationalization (7 points max)
  let i18nScore = 0;
  const i18nMax = 7;
  if (meta.language) i18nScore += 3;
  if (hreflangAnalysis.detected.length > 0) {
    i18nScore += 2;
    if (hreflangAnalysis.issues.length === 0) i18nScore += 2;
  }
  // Single language with lang attribute = 3 pts max (not 7)
  breakdown.push({
    category: 'Internationalization',
    score: Math.min(i18nScore, i18nMax),
    maxScore: i18nMax,
    details: meta.language ? `Lang: ${meta.language} | Versions: ${hreflangAnalysis.detected.length || 'single language'}` : 'No language declared',
  });

  // 8. Image Accessibility (5 points max) - penalize no images
  let imgScore = 0;
  const imgMax = 5;
  if (imageAnalysis.total > 0) {
    const altRatio = 1 - (imageAnalysis.withoutAlt / imageAnalysis.total);
    imgScore = Math.round(altRatio * 5);
  }
  // No images = 0 points (not 5 by default - images are expected on real sites)
  breakdown.push({
    category: 'Image Accessibility',
    score: Math.min(imgScore, imgMax),
    maxScore: imgMax,
    details: imageAnalysis.total === 0 ? 'No images found on page' : `${imageAnalysis.total - imageAnalysis.withoutAlt}/${imageAnalysis.total} images have alt text`,
  });

  // 9. Security & HTTPS (5 points max)
  let secScore = 0;
  const secMax = 5;
  if (securityHeaders.https) secScore += 2;
  if (securityHeaders.hsts) secScore += 1;
  if (securityHeaders.xContentType) secScore += 1;
  if (securityHeaders.csp || securityHeaders.xFrameOptions) secScore += 1;
  breakdown.push({
    category: 'Security & HTTPS',
    score: Math.min(secScore, secMax),
    maxScore: secMax,
    details: `HTTPS: ${securityHeaders.https ? '✓' : '✗'} | HSTS: ${securityHeaders.hsts ? '✓' : '✗'} | CSP: ${securityHeaders.csp ? '✓' : '✗'}`,
  });

  const totalScore = breakdown.reduce((sum, b) => sum + b.score, 0);
  const totalMax = breakdown.reduce((sum, b) => sum + b.maxScore, 0);
  const normalizedScore = Math.round((totalScore / totalMax) * 100);

  return { score: normalizedScore, breakdown };
}

// ─── Confidence Indicators ───────────────────────────────────────────

function buildConfidenceIndicators(
  html: string,
  meta: ReturnType<typeof extractMetaInfo>,
  robotsTxt: Awaited<ReturnType<typeof checkRobotsTxt>>,
  sitemap: Awaited<ReturnType<typeof checkSitemap>>,
  contentAnalysis: ContentAnalysis,
  merchantAnalysis: MerchantAnalysis,
  mappedUrlCount: number
): ConfidenceIndicator[] {
  const indicators: ConfidenceIndicator[] = [];

  indicators.push({
    aspect: 'HTML Analysis',
    level: html.length > 500 ? 'verified' : html.length > 0 ? 'partial' : 'uncertain',
    detail: html.length > 500
      ? `Full HTML analyzed (${Math.round(html.length / 1024)}KB)`
      : html.length > 0
        ? `Limited HTML retrieved (${html.length} chars). Some elements may be loaded dynamically.`
        : 'HTML could not be retrieved. Results may be inaccurate.',
  });

  indicators.push({
    aspect: 'Meta Tags',
    level: 'verified',
    detail: 'Meta tags are extracted directly from HTML source code.',
  });

  indicators.push({
    aspect: 'robots.txt',
    level: robotsTxt.found ? 'verified' : 'verified',
    detail: robotsTxt.found
      ? 'robots.txt retrieved via direct HTTP fetch.'
      : 'robots.txt not found at standard location (/robots.txt).',
  });

  indicators.push({
    aspect: 'Sitemap',
    level: sitemap.found ? 'verified' : 'verified',
    detail: sitemap.found
      ? `Sitemap found with ${sitemap.urlCount || 0} URLs. Validity: ${sitemap.isValid ? 'valid' : 'invalid'}.`
      : 'No sitemap found at /sitemap.xml or in robots.txt.',
  });

  indicators.push({
    aspect: 'URL Discovery',
    level: mappedUrlCount > 0 ? 'verified' : 'partial',
    detail: mappedUrlCount > 0
      ? `${mappedUrlCount} URLs discovered via site crawl.`
      : 'URL discovery limited to links found on analyzed page.',
  });

  indicators.push({
    aspect: 'Content Analysis',
    level: contentAnalysis.wordCount > 50 ? 'verified' : 'partial',
    detail: contentAnalysis.wordCount > 50
      ? `${contentAnalysis.wordCount} words analyzed. Keyword density and readability computed.`
      : 'Very little text content found. Page may rely on JavaScript rendering.',
  });

  indicators.push({
    aspect: 'AI Suggestions',
    level: contentAnalysis.suggestions.title ? 'partial' : 'not_checked',
    detail: contentAnalysis.suggestions.title
      ? 'AI suggestions are recommendations based on content analysis. Verify before applying.'
      : 'AI suggestions could not be generated.',
  });

  indicators.push({
    aspect: 'Merchant Center Detection',
    level: merchantAnalysis.merchantConfidence >= 70 ? 'verified' 
      : merchantAnalysis.merchantConfidence >= 40 ? 'partial' 
      : merchantAnalysis.isProductPage ? 'uncertain' : 'not_checked',
    detail: merchantAnalysis.isProductPage
      ? `Confiance Merchant : ${merchantAnalysis.merchantConfidence}% (${merchantAnalysis.merchantSignals.filter(s => s.found).length}/${merchantAnalysis.merchantSignals.length} signaux). ${merchantAnalysis.productPagesFound} URL(s) produit, ${merchantAnalysis.products.length} produit(s) analysés.`
      : 'Aucun signal e-commerce détecté. Site non-commercial probable.',
  });

  const brokenCount = ([] as BrokenLink[]).length; // placeholder - actual brokenLinks not in scope
  indicators.push({
    aspect: 'Broken Links',
    level: 'verified',
    detail: 'Up to 50 links checked via HEAD requests. Timeouts are classified separately from confirmed broken links for accuracy.',
  });

  indicators.push({
    aspect: 'PageSpeed Insights',
    level: 'verified',
    detail: 'Mobile and Desktop performance scores fetched from Google PageSpeed Insights API in real-time.',
  });

  indicators.push({
    aspect: 'Redirect Analysis',
    level: 'verified',
    detail: 'Redirect chains followed manually via HTTP HEAD requests (up to 10 hops).',
  });

  indicators.push({
    aspect: 'Schema.org Validation',
    level: 'verified',
    detail: 'JSON-LD structured data parsed and validated against Schema.org requirements.',
  });

  return indicators;
}

// ─── Autonomous Fix Generation ───────────────────────────────────────

function generateAutonomousFixes(
  url: string,
  meta: ReturnType<typeof extractMetaInfo>,
  robotsTxt: Awaited<ReturnType<typeof checkRobotsTxt>>,
  sitemap: Awaited<ReturnType<typeof checkSitemap>>,
  contentAnalysis: ContentAnalysis,
  merchantAnalysis: MerchantAnalysis,
  allLinks: string[]
): GeneratedFix[] {
  const fixes: GeneratedFix[] = [];
  const urlObj = new URL(url);
  const domain = `${urlObj.protocol}//${urlObj.host}`;

  // 1. Generate corrected robots.txt
  fixes.push({
    type: 'robots_txt',
    label: 'robots.txt optimisé',
    description: robotsTxt.found && !robotsTxt.blocksGooglebot
      ? 'Votre robots.txt est fonctionnel. Voici une version optimisée.'
      : 'Fichier robots.txt généré pour autoriser l\'indexation correcte.',
    content: generateOptimizedRobotsTxt(domain, robotsTxt),
    filename: 'robots.txt',
    status: 'auto_generated',
  });

  // 2. Generate COMPLETE sitemap.xml from Map API results
  const internalLinks = allLinks.filter((l: string) => {
    try { return new URL(l).host === urlObj.host; } catch { return false; }
  });

  fixes.push({
    type: 'sitemap_xml',
    label: 'sitemap.xml complet',
    description: `Sitemap généré avec ${internalLinks.length} URL(s) découvertes via crawl exhaustif du site.`,
    content: generateSitemapXml(domain, internalLinks),
    filename: 'sitemap.xml',
    status: 'needs_review',
  });

  // 3. Generate corrected meta tags
  if (contentAnalysis.suggestions.title || contentAnalysis.suggestions.description || !meta.title || !meta.description) {
    const suggestedTitle = contentAnalysis.suggestions.title || meta.title || `${urlObj.host} - Site officiel`;
    const suggestedDesc = contentAnalysis.suggestions.description || meta.description || `Découvrez ${urlObj.host}. Visitez notre site pour en savoir plus.`;
    
    fixes.push({
      type: 'meta_tags',
      label: 'Balises meta réécrites',
      description: 'Titres et descriptions optimisés pour le SEO avec mots-clés pertinents.',
      content: generateMetaTagsHtml(suggestedTitle, suggestedDesc, url, meta),
      filename: 'meta-tags.html',
      status: 'needs_review',
    });
  }

  // 4. Generate structured data JSON-LD
  if (!meta.hasOgTags || !meta.canonical) {
    const title = contentAnalysis.suggestions.title || meta.title || urlObj.host;
    const desc = contentAnalysis.suggestions.description || meta.description || '';
    fixes.push({
      type: 'structured_data',
      label: 'Données structurées JSON-LD',
      description: 'Code JSON-LD WebSite à ajouter dans le <head> de votre page.',
      content: generateWebsiteJsonLd(url, title, desc),
      filename: 'structured-data.json',
      status: 'needs_review',
    });
  }

  // 5. Generate Merchant feed CSV if product page
  if (merchantAnalysis.isProductPage && merchantAnalysis.products.length > 0) {
    fixes.push({
      type: 'merchant_feed',
      label: 'Flux produit Google Merchant',
      description: `Flux CSV généré avec ${merchantAnalysis.products.length} produit(s) pour Google Merchant Center.`,
      content: generateMerchantFeedCsv(merchantAnalysis.products, url),
      filename: 'merchant-feed.csv',
      status: 'needs_review',
    });
  }

  return fixes;
}

function generateOptimizedRobotsTxt(domain: string, current: { found: boolean; content: string | null; blocksGooglebot: boolean }): string {
  const lines = [
    '# robots.txt generated by SKAL IA',
    `# Site: ${domain}`,
    `# Date: ${new Date().toISOString().split('T')[0]}`,
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Block admin and internal pages',
    'Disallow: /admin/',
    'Disallow: /wp-admin/',
    'Disallow: /cart/',
    'Disallow: /checkout/',
    'Disallow: /account/',
    'Disallow: /search',
    'Disallow: /*?sort=',
    'Disallow: /*?filter=',
    '',
    '# Allow CSS and JS for rendering',
    'Allow: /wp-content/uploads/',
    'Allow: /*.css$',
    'Allow: /*.js$',
    '',
    `Sitemap: ${domain}/sitemap.xml`,
  ];
  return lines.join('\n');
}

function generateSitemapXml(domain: string, links: string[]): string {
  const uniqueLinks = [...new Set([domain + '/', ...links])].filter(l => {
    try {
      new URL(l);
      return true;
    } catch {
      return false;
    }
  });
  
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  uniqueLinks.forEach((link, i) => {
    const depth = link.replace(/^https?:\/\/[^/]+/, '').split('/').filter(Boolean).length;
    const priority = i === 0 ? '1.0' : depth <= 1 ? '0.8' : depth <= 2 ? '0.7' : '0.5';
    const changefreq = i === 0 ? 'daily' : depth <= 1 ? 'weekly' : 'monthly';
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(link)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  });
  
  xml += '</urlset>';
  return xml;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateMetaTagsHtml(title: string, description: string, url: string, meta: ReturnType<typeof extractMetaInfo>): string {
  const lines = [
    '<!-- SEO meta tags optimized by SKAL IA -->',
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${url}">`,
    '',
    '<!-- Open Graph -->',
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${url}">`,
    '<meta property="og:type" content="website">',
    '',
    '<!-- Twitter Card -->',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
  ];

  if (!meta.language) {
    lines.unshift('<!-- Add lang="fr" to your <html> tag -->');
  }

  return lines.join('\n');
}

function generateWebsiteJsonLd(url: string, name: string, description: string): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  return `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
}

function generateMerchantFeedCsv(products: ProductData[], pageUrl: string): string {
  const headers = ['id', 'title', 'description', 'link', 'image_link', 'price', 'availability', 'brand', 'gtin', 'mpn', 'condition', 'product_type'];
  
  const rows = products.map((p, i) => {
    const availability = p.availability?.includes('InStock') ? 'in_stock'
      : p.availability?.includes('OutOfStock') ? 'out_of_stock' : 'in_stock';
    const condition = p.condition?.includes('New') ? 'new' : 'new';
    
    return [
      `SKU-${i + 1}`,
      csvEscape(p.name || 'Produit sans titre'),
      csvEscape((p.description || '').substring(0, 5000)),
      pageUrl,
      p.image || '',
      `${p.price || '0'} ${p.currency || 'EUR'}`,
      availability,
      csvEscape(p.brand || ''),
      p.gtin || '',
      p.mpn || '',
      condition,
      '',
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

// ─── Action Report ───────────────────────────────────────────────────

function buildActionReport(
  issues: SEOIssue[],
  fixes: GeneratedFix[],
  meta: ReturnType<typeof extractMetaInfo>,
  sitemap: Awaited<ReturnType<typeof checkSitemap>>,
  robotsTxt: Awaited<ReturnType<typeof checkRobotsTxt>>,
  merchantAnalysis: MerchantAnalysis,
  contentAnalysis: ContentAnalysis
): ActionReport {
  const automated: ActionReport['automated'] = [];
  const manual: ActionReport['manual'] = [];
  const lovablePrompts: LovablePrompt[] = [];

  // ── Automated fixes already generated ──
  fixes.forEach(fix => {
    automated.push({
      action: fix.label,
      status: fix.status === 'auto_generated' ? '✅ Généré' : '📝 À vérifier',
      details: fix.description,
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // GOOGLE SEARCH — Recommandations basées sur les données réelles
  // ══════════════════════════════════════════════════════════════════

  // Indexation bloquée
  if (meta.robots?.includes('noindex')) {
    manual.push({ action: 'Supprimer la directive noindex', instructions: 'La balise <meta name="robots" content="noindex"> empêche Google d\'indexer cette page. Modifiez-la pour retirer "noindex" si vous voulez apparaître dans les résultats de recherche.', priority: 'High' });
  }
  if (robotsTxt.blocksGooglebot) {
    manual.push({ action: 'Débloquer Googlebot dans robots.txt', instructions: 'Votre robots.txt contient "Disallow: /" pour Googlebot ou tous les agents. Cela bloque l\'indexation de tout votre site. Modifiez la règle pour autoriser l\'accès.', priority: 'High' });
  }

  // Balise title
  if (!meta.title) {
    manual.push({ action: 'Ajouter une balise <title>', instructions: 'Chaque page doit avoir un <title> unique de 50-60 caractères contenant votre mot-clé principal. C\'est le facteur on-page #1 pour le référencement Google.', priority: 'High' });
  } else if (meta.title.length > 60) {
    manual.push({ action: 'Raccourcir la balise <title>', instructions: `Votre title fait ${meta.title.length} caractères. Google tronque au-delà de 60 caractères. Raccourcissez-le tout en gardant votre mot-clé principal au début.`, priority: 'Medium' });
  } else if (meta.title.length < 20) {
    manual.push({ action: 'Enrichir la balise <title>', instructions: `Votre title ne fait que ${meta.title.length} caractères. Utilisez l'espace disponible (50-60 car.) pour inclure votre mot-clé principal et une proposition de valeur.`, priority: 'Medium' });
  }

  // Meta description
  if (!meta.description) {
    manual.push({ action: 'Ajouter une meta description', instructions: 'Ajoutez <meta name="description" content="..."> de 150-160 caractères. Bien qu\'elle n\'affecte pas directement le ranking, elle influence fortement le taux de clic (CTR) dans les résultats Google.', priority: 'High' });
  } else if (meta.description.length > 160) {
    manual.push({ action: 'Raccourcir la meta description', instructions: `Votre description fait ${meta.description.length} caractères. Google tronque au-delà de 160 caractères. Gardez le message essentiel dans les 160 premiers caractères.`, priority: 'Low' });
  }

  // H1
  if (!meta.hasH1) {
    manual.push({ action: 'Ajouter une balise H1', instructions: 'Ajoutez un H1 unique contenant votre mot-clé principal. Google utilise le H1 pour comprendre le sujet de la page. Chaque page doit avoir exactement un H1.', priority: 'High' });
  } else if (meta.h1Count > 1) {
    manual.push({ action: 'Garder un seul H1 par page', instructions: `${meta.h1Count} balises H1 détectées. Google recommande un seul H1 par page. Convertissez les H1 supplémentaires en H2 ou H3.`, priority: 'Medium' });
  }

  // Langue
  if (!meta.language) {
    manual.push({ action: 'Déclarer la langue du site', instructions: 'Ajoutez lang="fr" (ou la langue appropriée) à votre balise <html>. Google utilise cette information pour le ciblage linguistique et l\'affichage dans les résultats de recherche locaux.', priority: 'Medium' });
  }

  // Open Graph
  if (!meta.hasOgTags) {
    manual.push({ action: 'Ajouter les balises Open Graph', instructions: 'Ajoutez og:title, og:description, og:image et og:url. Ces balises contrôlent l\'apparence de vos pages quand elles sont partagées sur les réseaux sociaux (Facebook, LinkedIn).', priority: 'Medium' });
  }
  if (!meta.hasTwitterCards) {
    manual.push({ action: 'Ajouter les Twitter Cards', instructions: 'Ajoutez <meta name="twitter:card" content="summary_large_image"> et les balises associées pour un affichage optimisé sur Twitter/X.', priority: 'Low' });
  }

  // Canonical
  if (!meta.canonical) {
    manual.push({ action: 'Ajouter une balise canonical', instructions: 'Ajoutez <link rel="canonical" href="URL"> pour indiquer à Google la version principale de cette page. Cela évite le contenu dupliqué et consolide le "link juice".', priority: 'Medium' });
  }

  // Sitemap
  if (!sitemap.found) {
    manual.push({ action: 'Déployer un sitemap.xml', instructions: 'Aucun sitemap.xml trouvé. Téléchargez le sitemap généré par SKAL IA et placez-le à la racine de votre site. Puis soumettez-le dans Google Search Console sous Sitemaps > Ajouter un sitemap.', priority: 'High' });
  } else if (sitemap.found && !sitemap.isValid) {
    manual.push({ action: 'Corriger le sitemap.xml', instructions: 'Votre sitemap existe mais contient des erreurs de format. Assurez-vous qu\'il est en XML valide avec la balise <urlset> et des entrées <url><loc>.', priority: 'High' });
  }

  // Robots.txt
  if (!robotsTxt.found) {
    manual.push({ action: 'Créer un robots.txt', instructions: 'Aucun robots.txt trouvé. Téléchargez celui généré par SKAL IA et placez-le à la racine de votre domaine. Il doit contenir User-agent: * et Sitemap: [URL de votre sitemap].', priority: 'Medium' });
  }

  // ══════════════════════════════════════════════════════════════════
  // GOOGLE MERCHANT CENTER — Recommandations basées sur les données réelles  
  // ══════════════════════════════════════════════════════════════════

  if (merchantAnalysis.isProductPage) {
    const products = merchantAnalysis.products;
    const compliance = merchantAnalysis.compliance;

    // Données structurées produit
    if (!merchantAnalysis.structuredDataFound) {
      manual.push({ action: '[Merchant] Ajouter le balisage Product JSON-LD', instructions: 'Google Merchant Center exige des données structurées Product sur chaque page produit. Ajoutez un script type="application/ld+json" avec @type: "Product", incluant name, image, offers (price, priceCurrency, availability).', priority: 'High' });
    }

    // GTIN / Identifiants
    if (products.length > 0) {
      const withGTIN = products.filter(p => p.gtin || (p.mpn && p.brand));
      if (withGTIN.length < products.length) {
        const missing = products.length - withGTIN.length;
        manual.push({ action: `[Merchant] Ajouter GTIN/EAN sur ${missing} produit(s)`, instructions: `${missing} produit(s) n'ont pas d'identifiant produit. Google exige un GTIN (EAN-13, UPC-A, ISBN) pour chaque produit. Si le produit n'a pas de GTIN, fournissez MPN + brand. Sans identifiant, vos produits seront refusés par Google Shopping.`, priority: 'High' });
      }

      // Disponibilité
      const withAvail = products.filter(p => p.availability);
      if (withAvail.length < products.length) {
        manual.push({ action: `[Merchant] Ajouter le statut de disponibilité`, instructions: `${products.length - withAvail.length} produit(s) sans attribut "availability" dans le JSON-LD. Utilisez les valeurs Schema.org : "https://schema.org/InStock", "https://schema.org/OutOfStock", "https://schema.org/PreOrder". Obligatoire pour l'approbation.`, priority: 'High' });
      }

      // Images
      const withImages = products.filter(p => p.image);
      if (withImages.length < products.length) {
        manual.push({ action: `[Merchant] Ajouter les images produits manquantes`, instructions: `${products.length - withImages.length} produit(s) sans image. Exigences Google : minimum 100x100px (250x250px recommandé pour vêtements), fond blanc ou neutre, sans watermark ni texte promotionnel, sans bordure. Le produit doit occuper 75-90% de l'image.`, priority: 'High' });
      }

      // Prix
      const withPrice = products.filter(p => p.price && p.currency);
      if (withPrice.length < products.length) {
        manual.push({ action: `[Merchant] Compléter les prix et devises`, instructions: `${products.length - withPrice.length} produit(s) sans prix ou devise. Le prix dans le JSON-LD doit correspondre exactement au prix affiché sur la page. La devise doit être au format ISO 4217 (EUR, USD, GBP). Toute incohérence = refus.`, priority: 'High' });
      }

      // Devises multiples
      const currencies = [...new Set(products.map(p => p.currency).filter(Boolean))];
      if (currencies.length > 1) {
        manual.push({ action: '[Merchant] Uniformiser les devises', instructions: `${currencies.length} devises détectées (${currencies.join(', ')}). Un flux Merchant Center ne peut contenir qu'une seule devise, correspondant au pays cible. Créez des flux séparés par pays/devise si vous vendez à l'international.`, priority: 'High' });
      }
    }

    // Pages de politique (basé sur les vérifications compliance réelles)
    if (compliance) {
      const missingPolicies = compliance.checks.filter(c => !c.found && c.category === 'policy');
      missingPolicies.forEach(check => {
        const policyGuides: Record<string, string> = {
          'Politique de retour/remboursement': 'Créez une page dédiée contenant : délai de retour (14 ou 30 jours minimum en UE), conditions du produit pour retour, processus étape par étape, mode de remboursement, exceptions éventuelles. URL type : /politique-de-retour',
          'Politique de livraison': 'Créez une page contenant : zones de livraison, délais estimés par zone, coûts de livraison (ou seuil de gratuité), transporteurs utilisés, suivi de commande. URL type : /livraison',
          'CGV / Conditions générales': 'Page obligatoire contenant : identité du vendeur (raison sociale, adresse, SIRET), conditions de vente, modalités de paiement, limitation de responsabilité, droit applicable, juridiction. URL type : /cgv',
          'Page de contact': 'Page avec au minimum : adresse physique, email, téléphone, et idéalement un formulaire de contact. Google vérifie manuellement la présence d\'informations de contact vérifiables.',
          'Politique de confidentialité': 'Page obligatoire (RGPD) contenant : données collectées et finalités, base légale du traitement, durée de conservation, droits des utilisateurs (accès, rectification, suppression), usage des cookies, partage avec des tiers. URL type : /confidentialite',
        };
        manual.push({
          action: `[Merchant] Créer : ${check.name}`,
          instructions: policyGuides[check.name] || `Page "${check.name}" manquante. Obligatoire pour l'approbation Merchant Center.`,
          priority: 'High',
        });
      });

      // Pages avec contenu insuffisant
      const insufficientContent = compliance.checks.filter(c => c.found && c.contentAnalyzed && !c.contentValid);
      insufficientContent.forEach(check => {
        manual.push({
          action: `[Merchant] Améliorer le contenu : ${check.name}`,
          instructions: `Page trouvée mais contenu jugé insuffisant par l'analyse IA. Problème(s) : ${check.contentIssues.join(' • ')}. Google effectue une vérification manuelle du contenu de ces pages. Un contenu trop vague ou incomplet entraîne un refus.`,
          priority: 'High',
        });
      });

      // Identité vendeur
      const identityCheck = compliance.checks.find(c => c.name === 'Informations vendeur');
      if (identityCheck && !identityCheck.contentValid) {
        manual.push({ action: '[Merchant] Compléter l\'identité du vendeur', instructions: 'Google Merchant Center exige une identité vérifiable : nom d\'entreprise ou nom légal, adresse physique complète (pas de boîte postale), numéro d\'enregistrement (SIRET, TVA intracommunautaire). Ces informations doivent être visibles sur le site, idéalement dans les mentions légales et le footer.', priority: 'High' });
      }

      // Paiement
      const paymentCheck = compliance.checks.find(c => c.name === 'Paiement sécurisé');
      if (paymentCheck && !paymentCheck.contentValid) {
        manual.push({ action: '[Merchant] Sécuriser le processus de paiement', instructions: 'Exigences Google : checkout en HTTPS avec certificat SSL valide, page de paiement accessible sans inscription obligatoire préalable, moyens de paiement clairement affichés (Visa, Mastercard, PayPal...), prix final incluant toutes les taxes visible avant la confirmation.', priority: 'High' });
      }

      // HTTPS
      const httpsCheck = compliance.checks.find(c => c.name === 'HTTPS / SSL obligatoire');
      if (httpsCheck && !httpsCheck.contentValid) {
        manual.push({ action: '[Merchant] Passer tout le site en HTTPS', instructions: 'Google Merchant Center exige HTTPS sur toutes les pages, en particulier : pages produits, checkout, pages de politique. Installez un certificat SSL (Let\'s Encrypt est gratuit) et redirigez tout le trafic HTTP vers HTTPS via une redirection 301.', priority: 'High' });
      }
    }

    // Soumission du flux
    if (products.length > 0) {
      manual.push({ action: '[Merchant] Soumettre le flux produits', instructions: 'Téléchargez le flux CSV/XML généré par SKAL IA. Connectez-vous à merchants.google.com > Produits > Flux > Ajouter un flux. Sélectionnez votre pays et langue cibles. Importez le fichier. Google analysera votre flux sous 3-5 jours ouvrables.', priority: 'High' });
    }
  }

  // Ajouter les issues critiques manuelles restantes (dédoublonnées)
  issues.filter(i => i.priority === 'High' && i.fixType === 'manual').forEach(issue => {
    const alreadyListed = manual.some(m => m.action.includes(issue.issue.substring(0, 20)));
    if (!alreadyListed) {
      manual.push({ action: issue.issue, instructions: issue.fix, priority: issue.priority });
    }
  });

  // ══════════════════════════════════════════════════════════════════
  // SOLUTIONS — Génération dynamique à partir de TOUS les problèmes
  // ══════════════════════════════════════════════════════════════════

  // Map each issue category to a solution category
  const categoryMap: Record<string, LovablePrompt['category']> = {
    'Meta Tags': 'seo',
    'Indexation': 'seo',
    'Structure': 'seo',
    'Content': 'content',
    'Mobile & Performance': 'performance',
    'Security': 'security',
    'Image Accessibility': 'seo',
    'Heading Hierarchy': 'seo',
    'Schema.org': 'seo',
    'Merchant Center': 'merchant',
  };

  // Generate a solution prompt for EVERY issue detected
  const seenTitles = new Set<string>();

  issues.forEach(issue => {
    // Avoid duplicates
    const key = issue.issue.substring(0, 50);
    if (seenTitles.has(key)) return;
    seenTitles.add(key);

    const cat = categoryMap[issue.category] || 'seo';

    lovablePrompts.push({
      title: issue.issue,
      prompt: `Problème détecté : ${issue.issue}.\n\nImpact : ${issue.impact}\n\nSolution recommandée : ${issue.fix}`,
      category: cat,
      priority: issue.priority,
    });
  });

  // Add merchant compliance-specific solutions if not already covered
  if (merchantAnalysis.isProductPage && merchantAnalysis.compliance) {
    const compliance = merchantAnalysis.compliance;
    
    compliance.checks.filter(c => !c.found && c.category === 'policy').forEach(check => {
      const key = `Créer : ${check.name}`;
      if (!seenTitles.has(key.substring(0, 50))) {
        seenTitles.add(key.substring(0, 50));
        const policyGuides: Record<string, string> = {
          'Politique de retour/remboursement': 'Crée une page dédiée avec : délai de retour (14-30 jours en UE), conditions du produit, processus étape par étape, mode de remboursement, exceptions. URL : /politique-de-retour',
          'Politique de livraison': 'Crée une page avec : zones de livraison, délais par zone, coûts (ou seuil gratuité), transporteurs, suivi de commande. URL : /livraison',
          'CGV / Conditions générales': 'Crée une page avec : identité vendeur (raison sociale, adresse, SIRET), conditions de vente, modalités de paiement, droit applicable. URL : /cgv',
          'Page de contact': 'Crée une page avec : adresse physique, email, téléphone, formulaire de contact. Google vérifie manuellement ces informations.',
          'Politique de confidentialité': 'Crée une page RGPD avec : données collectées, base légale, durée de conservation, droits utilisateurs, cookies, tiers. URL : /confidentialite',
        };
        lovablePrompts.push({
          title: `Créer : ${check.name}`,
          prompt: `Page obligatoire manquante pour Google Merchant Center : ${check.name}.\n\n${policyGuides[check.name] || `Crée une page "${check.name}" complète et professionnelle.`}`,
          category: 'merchant',
          priority: 'High',
        });
      }
    });

    compliance.checks.filter(c => c.found && c.contentAnalyzed && !c.contentValid).forEach(check => {
      const key = `Améliorer : ${check.name}`;
      if (!seenTitles.has(key.substring(0, 50))) {
        seenTitles.add(key.substring(0, 50));
        lovablePrompts.push({
          title: `Améliorer : ${check.name}`,
          prompt: `Le contenu de la page "${check.name}" est insuffisant pour Google Merchant Center.\n\nProblèmes : ${check.contentIssues.join(' • ')}\n\nEnrichis le contenu pour qu'il soit complet, détaillé et conforme aux exigences Google.`,
          category: 'merchant',
          priority: 'High',
        });
      }
    });
  }

  return { automated, manual, lovablePrompts };
}

// ─── Analysis Functions ──────────────────────────────────────────────

function extractMetaInfo(html: string, metadata: Record<string, unknown>) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : (metadata.title as string) || null;

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : (metadata.description as string) || null;

  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
                         html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : null;

  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i);
  const robots = robotsMatch ? robotsMatch[1].trim() : null;

  const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  const language = langMatch ? langMatch[1].trim() : (metadata.language as string) || null;

  const hreflangMatches = html.matchAll(/<link[^>]*hreflang=["']([^"']+)["'][^>]*>/gi);
  const hreflang = Array.from(hreflangMatches).map(m => m[1]);

  const h1Matches = html.match(/<h1[^>]*>/gi) || [];
  const hasH1 = h1Matches.length > 0;
  const h1Count = h1Matches.length;

  const hasOgTags = /<meta[^>]*property=["']og:/i.test(html);
  const hasTwitterCards = /<meta[^>]*name=["']twitter:/i.test(html);

  return { title, description, canonical, robots, language, hreflang, hasH1, h1Count, hasOgTags, hasTwitterCards };
}

// Direct HTTP fetch for robots.txt (no Firecrawl API call needed)
async function checkRobotsTxt(url: string) {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
    
    const response = await fetch(robotsUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'SKAL-IA-Bot/4.0' },
    });

    if (!response.ok) {
      return { found: false, content: null, blocksGooglebot: false, error: `HTTP ${response.status}` };
    }

    const contentType = response.headers.get('content-type') || '';
    // Make sure it's actually a text file, not an HTML error page
    if (contentType.includes('text/html')) {
      return { found: false, content: null, blocksGooglebot: false, error: 'robots.txt returns HTML (likely a 404 page)' };
    }

    const content = await response.text();
    
    // Validate it looks like a real robots.txt
    const looksValid = /user-agent/i.test(content) || /disallow/i.test(content) || /allow/i.test(content) || /sitemap/i.test(content);
    if (!looksValid && content.length > 0) {
      return { found: false, content: null, blocksGooglebot: false, error: 'File does not appear to be a valid robots.txt' };
    }

    const blocksGooglebot = /User-agent:\s*\*[\s\S]*?Disallow:\s*\/(?!\S)/i.test(content) ||
                            /User-agent:\s*Googlebot[\s\S]*?Disallow:\s*\/(?!\S)/i.test(content);

    return { found: true, content: content.substring(0, 2000), blocksGooglebot, error: null };
  } catch (error) {
    console.error('Error checking robots.txt:', error);
    return { found: false, content: null, blocksGooglebot: false, error: error instanceof Error ? error.message : 'Failed to check robots.txt' };
  }
}

async function checkSitemap(url: string, robotsContent: string | null) {
  try {
    const urlObj = new URL(url);
    let sitemapUrl = `${urlObj.protocol}//${urlObj.host}/sitemap.xml`;
    
    if (robotsContent) {
      const sitemapMatch = robotsContent.match(/Sitemap:\s*(\S+)/i);
      if (sitemapMatch) sitemapUrl = sitemapMatch[1];
    }

    const response = await fetch(sitemapUrl, { signal: AbortSignal.timeout(10000) });
    
    if (!response.ok) {
      return { found: false, url: null, error: 'Sitemap not found', isValid: false, urlCount: null };
    }

    const sitemapContent = await response.text();
    const isValid = sitemapContent.includes('<?xml') && 
                    (sitemapContent.includes('<urlset') || sitemapContent.includes('<sitemapindex'));
    const urlMatches = sitemapContent.match(/<loc>/gi);
    const urlCount = urlMatches ? urlMatches.length : 0;

    return { found: true, url: sitemapUrl, error: null, isValid, urlCount };
  } catch (error) {
    console.error('Error checking sitemap:', error);
    return { found: false, url: null, error: error instanceof Error ? error.message : 'Failed to check sitemap', isValid: false, urlCount: null };
  }
}

async function checkBrokenLinks(links: string[]): Promise<BrokenLink[]> {
  const checkPromises = links.map(async (link) => {
    try {
      if (!link.startsWith('http')) return null;
      const response = await fetch(link, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
      if (!response.ok) return { url: link, statusCode: response.status, error: null, status: 'broken' as const };
      return null;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Request failed';
      const isTimeout = errMsg.includes('timeout') || errMsg.includes('abort') || errMsg.includes('Timed out');
      return { 
        url: link, 
        statusCode: null, 
        error: errMsg, 
        status: isTimeout ? 'timeout' as const : 'error' as const 
      };
    }
  });

  const results = await Promise.all(checkPromises);
  return results.filter((r): r is BrokenLink => r !== null);
}

// ─── GSC Detection (multi-signal) ────────────────────────────────────

function detectGSC(
  html: string,
  sitemap: { found: boolean; isValid: boolean; urlCount: number | null },
  robotsTxt: { found: boolean; blocksGooglebot: boolean; content: string | null }
): GSCDetection {
  const signals: GSCDetection['signals'] = [];

  // Signal 1: google-site-verification meta tag (strongest signal)
  const verificationMatch = html.match(/<meta[^>]*name=["']google-site-verification["'][^>]*content=["']([^"']+)["']/i);
  signals.push({
    signal: 'Balise google-site-verification',
    found: !!verificationMatch,
    detail: verificationMatch
      ? `Balise de vérification Google détectée (${verificationMatch[1].substring(0, 12)}...). Le propriétaire a vérifié le site auprès de Google.`
      : 'Aucune balise google-site-verification trouvée. Le site n\'a peut-être pas été vérifié via cette méthode.',
  });

  // Signal 2: Google Analytics (GA4 or UA)
  const hasGA4 = /gtag\s*\(\s*['"]config['"]\s*,\s*['"]G-/i.test(html) || /googletagmanager\.com\/gtag/i.test(html);
  const hasUA = /gtag\s*\(\s*['"]config['"]\s*,\s*['"]UA-/i.test(html) || /google-analytics\.com\/analytics\.js/i.test(html);
  const hasGA = hasGA4 || hasUA;
  signals.push({
    signal: 'Google Analytics',
    found: hasGA,
    detail: hasGA
      ? `${hasGA4 ? 'GA4' : 'Universal Analytics'} détecté. Indique que le propriétaire utilise l'écosystème Google, forte corrélation avec GSC.`
      : 'Aucun tracking Google Analytics détecté.',
  });

  // Signal 3: Google Tag Manager
  const hasGTM = /googletagmanager\.com\/gtm\.js/i.test(html) || /GTM-[A-Z0-9]+/i.test(html);
  signals.push({
    signal: 'Google Tag Manager',
    found: hasGTM,
    detail: hasGTM
      ? 'GTM détecté. Les sites utilisant GTM ont très souvent GSC configuré.'
      : 'Aucun Google Tag Manager détecté.',
  });

  // Signal 4: Valid sitemap submitted (indirect)
  const hasSitemap = sitemap.found && sitemap.isValid;
  signals.push({
    signal: 'Sitemap XML valide',
    found: hasSitemap,
    detail: hasSitemap
      ? `Sitemap valide avec ${sitemap.urlCount || 0} URL(s). Un sitemap bien structuré est souvent soumis via GSC.`
      : 'Aucun sitemap valide trouvé. Sans sitemap, GSC est peu utile.',
  });

  // Signal 5: robots.txt well configured
  const hasGoodRobots = robotsTxt.found && !robotsTxt.blocksGooglebot;
  signals.push({
    signal: 'robots.txt bien configuré',
    found: hasGoodRobots,
    detail: hasGoodRobots
      ? 'robots.txt autorise Googlebot. Cohérent avec une configuration GSC active.'
      : robotsTxt.blocksGooglebot ? 'robots.txt bloque Googlebot — peu compatible avec GSC.' : 'Pas de robots.txt trouvé.',
  });

  // Signal 6: Sitemap reference in robots.txt
  const sitemapInRobots = robotsTxt.content ? /Sitemap:/i.test(robotsTxt.content) : false;
  signals.push({
    signal: 'Sitemap référencé dans robots.txt',
    found: sitemapInRobots,
    detail: sitemapInRobots
      ? 'Le sitemap est déclaré dans robots.txt — bonne pratique, souvent fait après configuration GSC.'
      : 'Aucune directive Sitemap: dans robots.txt.',
  });

  // Calculate confidence
  const weights = [30, 20, 15, 15, 10, 10]; // verification > GA > GTM > sitemap > robots > sitemap-in-robots
  let earned = 0;
  signals.forEach((s, i) => { if (s.found) earned += weights[i]; });
  const confidence = Math.min(95, earned); // Cap at 95% because we can never be 100% sure

  return {
    detected: confidence >= 50,
    confidence,
    signals,
  };
}

function generateGSCInstructions(url: string, sitemap: { found: boolean; url: string | null }, robotsTxt: { found: boolean }): string[] {
  const instructions: string[] = [
    "1. Log in to Google Search Console (search.google.com/search-console)",
    `2. Add property "${new URL(url).host}" if not already done`,
    "3. Verify via DNS, HTML tag, or HTML file",
  ];

  if (sitemap.found && sitemap.url) {
    instructions.push(`4. Submit your sitemap: Sitemaps → Add sitemap → "${sitemap.url}"`);
  } else {
    instructions.push("4. First create a sitemap.xml, then submit it under the Sitemaps tab");
  }

  instructions.push(
    "5. Use the URL Inspection tool to request indexing for important pages",
    "6. Monitor coverage reports for indexing errors"
  );

  return instructions;
}

async function analyzeContent(
  markdown: string,
  meta: { title: string | null; description: string | null },
  url: string
): Promise<ContentAnalysis> {
  const words = markdown.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  const sentences = markdown.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
  const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 3));
  
  const stopWords = new Set(['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en', 'à', 'pour', 'que', 'qui', 'dans', 'sur', 'par', 'avec', 'ce', 'cette', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'it', 'its', 'this', 'that', 'these', 'those']);
  
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    const cleaned = word.toLowerCase().replace(/[^a-zàâäéèêëïîôùûüç]/g, '');
    if (cleaned.length > 3 && !stopWords.has(cleaned)) {
      wordFrequency[cleaned] = (wordFrequency[cleaned] || 0) + 1;
    }
  });
  
  const keywordDensity = Object.entries(wordFrequency)
    .map(([keyword, count]) => ({ keyword, count, density: Math.round((count / wordCount) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  const paragraphs = markdown.split(/\n\n+/).filter(p => p.trim().length > 50);
  const paragraphCounts: Record<string, number> = {};
  paragraphs.forEach(p => {
    const normalized = p.trim().toLowerCase().substring(0, 100);
    paragraphCounts[normalized] = (paragraphCounts[normalized] || 0) + 1;
  });
  
  const duplicateContent = Object.entries(paragraphCounts)
    .filter(([_, count]) => count > 1)
    .map(([text, count]) => ({ text: text.substring(0, 50) + '...', count }));
  
  const suggestions = await generateSEOSuggestions(meta, markdown, url);
  
  return { wordCount, readabilityScore: Math.round(readabilityScore), keywordDensity, duplicateContent, suggestions };
}

async function generateSEOSuggestions(
  meta: { title: string | null; description: string | null },
  content: string,
  url: string
): Promise<{ title: string | null; description: string | null; improvements: string[] }> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    console.log('LOVABLE_API_KEY not available, skipping AI suggestions');
    return { title: null, description: null, improvements: [] };
  }
  
  try {
    const contentPreview = content.substring(0, 1500);
    const prompt = `You are an SEO expert. Analyze this web content and generate SEO suggestions.
Use industry-standard terminology: site audit, technical SEO, on-page optimization, SERP ranking, crawlability, Core Web Vitals, schema markup, backlink profile, keyword research, search intent, domain authority, page speed, mobile-first indexing.

URL: ${url}
Current title: ${meta.title || 'None'}
Current description: ${meta.description || 'None'}

Content (excerpt):
${contentPreview}

Respond ONLY in valid JSON with this exact structure:
{
  "suggestedTitle": "New SEO-optimized title (max 60 chars)",
  "suggestedDescription": "New optimized meta description (max 155 chars)",
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('AI Gateway error:', response.status);
      return { title: null, description: null, improvements: [] };
    }

    const aiData = await response.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.suggestedTitle || null,
        description: parsed.suggestedDescription || null,
        improvements: parsed.improvements || [],
      };
    }
    
    return { title: null, description: null, improvements: [] };
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return { title: null, description: null, improvements: [] };
  }
}

function analyzeHreflang(
  html: string, 
  currentLang: string | null,
  sitemap: { found: boolean; url: string | null; isValid: boolean }
): HreflangAnalysis {
  const detected: { lang: string; url: string }[] = [];
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // 1. Check hreflang in HTML
  const hreflangRegex = /<link[^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  const hreflangRegex2 = /<link[^>]*href=["']([^"']+)["'][^>]*hreflang=["']([^"']+)["'][^>]*>/gi;
  
  let match;
  while ((match = hreflangRegex.exec(html)) !== null) {
    detected.push({ lang: match[1], url: match[2] });
  }
  while ((match = hreflangRegex2.exec(html)) !== null) {
    detected.push({ lang: match[2], url: match[1] });
  }

  // 2. Check hreflang in sitemap (if HTML had none, try sitemap)
  // Note: we already fetched sitemap content in checkSitemap, but we can note if sitemap-based hreflang exists
  if (detected.length === 0 && sitemap.found && sitemap.url) {
    recommendations.push('If your site is multilingual, consider adding hreflang tags in HTML or using xhtml:link in your sitemap.xml for better detection.');
  }
  
  // Deduplicate
  const seen = new Set<string>();
  const uniqueDetected = detected.filter(d => {
    const key = `${d.lang}:${d.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  const hasXDefault = uniqueDetected.some(d => d.lang === 'x-default');
  
  if (uniqueDetected.length === 0 && currentLang) {
    issues.push('No hreflang tags detected');
    recommendations.push('Add hreflang tags if your site exists in multiple languages');
  }
  
  if (uniqueDetected.length > 0 && !hasXDefault) {
    issues.push('Missing hreflang x-default tag');
    recommendations.push('Add an hreflang="x-default" tag pointing to the default version');
  }
  
  if (uniqueDetected.length > 0 && currentLang) {
    const hasSelfRef = uniqueDetected.some(d => d.lang === currentLang || d.lang.startsWith(currentLang + '-'));
    if (!hasSelfRef) {
      issues.push('Page does not self-reference in hreflang');
      recommendations.push('Each page must include an hreflang pointing to itself');
    }
  }
  
  const validLangCodes = ['fr', 'en', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'bn', 'tr', 'vi', 'pl', 'uk', 'ro', 'sv', 'da', 'fi', 'no', 'cs', 'el', 'hu', 'th', 'id', 'ms', 'he', 'fa', 'x-default'];
  uniqueDetected.forEach(d => {
    const baseLang = d.lang.split('-')[0].toLowerCase();
    if (!validLangCodes.includes(baseLang) && d.lang !== 'x-default') {
      issues.push(`Potentially invalid language code: ${d.lang}`);
    }
  });
  
  if (uniqueDetected.length > 0) {
    recommendations.push(`${uniqueDetected.length} language version(s) detected: ${uniqueDetected.map(d => d.lang).join(', ')}`);
  }
  
  return { detected: uniqueDetected, issues, recommendations };
}

async function analyzeMerchantDataAdvanced(html: string, allSiteUrls: string[], apiKey: string): Promise<MerchantAnalysis> {
  const signals: MerchantSignal[] = [];
  const products: ProductData[] = [];
  const issues: { issue: string; impact: string; fix: string; priority: 'High' | 'Medium' | 'Low' }[] = [];
  const feedRecommendations: string[] = [];
  
  // ── Signal 1: JSON-LD Product on homepage ──
  const homepageProducts = extractProductsFromHtml(html);
  const structuredDataFound = homepageProducts.length > 0;
  products.push(...homepageProducts);
  
  signals.push({
    signal: 'JSON-LD Product (page principale)',
    found: structuredDataFound,
    detail: structuredDataFound 
      ? `${homepageProducts.length} produit(s) avec données structurées détectés sur la page analysée.`
      : 'Aucun balisage Product JSON-LD trouvé sur la page analysée.',
    weight: 25,
  });

  // ── Signal 2: Product URLs in site map ──
  const productUrlPatterns = /\/(product|produit|shop|boutique|article|item|collection|catalog|p\/|products\/|store\/)/i;
  const productUrls = allSiteUrls.filter(u => productUrlPatterns.test(u));
  const hasProductUrls = productUrls.length > 0;
  
  signals.push({
    signal: 'URLs produit détectées (site map)',
    found: hasProductUrls,
    detail: hasProductUrls
      ? `${productUrls.length} URL(s) de type produit/shop trouvées dans la structure du site.`
      : 'Aucune URL de type /product/, /shop/, /boutique/ trouvée dans la structure du site.',
    weight: 20,
  });

  // ── Signal 3: Google Shopping / gtag events ──
  const gtagPatterns = [
    { pattern: /gtag\s*\(\s*['"]event['"]\s*,\s*['"]purchase['"]/i, name: 'purchase' },
    { pattern: /gtag\s*\(\s*['"]event['"]\s*,\s*['"]add_to_cart['"]/i, name: 'add_to_cart' },
    { pattern: /gtag\s*\(\s*['"]event['"]\s*,\s*['"]view_item['"]/i, name: 'view_item' },
    { pattern: /gtag\s*\(\s*['"]event['"]\s*,\s*['"]begin_checkout['"]/i, name: 'begin_checkout' },
    { pattern: /googleadservices\.com\/pagead\/conversion/i, name: 'conversion_tracking' },
    { pattern: /google\.com\/merchant/i, name: 'merchant_reference' },
    { pattern: /googlesyndication|google_shopping|merchant_id/i, name: 'shopping_integration' },
  ];
  const foundGtagEvents = gtagPatterns.filter(p => p.pattern.test(html));
  const hasGtagShopping = foundGtagEvents.length > 0;
  
  signals.push({
    signal: 'Google Shopping / gtag events',
    found: hasGtagShopping,
    detail: hasGtagShopping
      ? `Événements détectés : ${foundGtagEvents.map(e => e.name).join(', ')}. Indique une intégration e-commerce Google active.`
      : 'Aucun événement gtag e-commerce (purchase, add_to_cart, view_item) détecté dans le code source.',
    weight: 20,
  });

  // ── Signal 4: E-commerce platform indicators ──
  const platformPatterns = [
    { pattern: /Shopify\.theme|shopify\.com|cdn\.shopify/i, name: 'Shopify' },
    { pattern: /WooCommerce|woocommerce|wc-/i, name: 'WooCommerce' },
    { pattern: /PrestaShop|prestashop/i, name: 'PrestaShop' },
    { pattern: /Magento|magento/i, name: 'Magento' },
    { pattern: /BigCommerce|bigcommerce/i, name: 'BigCommerce' },
    { pattern: /Squarespace\.com.*commerce|squarespace.*product/i, name: 'Squarespace Commerce' },
    { pattern: /wix\.com.*stores|wixstores/i, name: 'Wix Stores' },
  ];
  const detectedPlatforms = platformPatterns.filter(p => p.pattern.test(html));
  const hasEcommercePlatform = detectedPlatforms.length > 0;
  
  signals.push({
    signal: 'Plateforme e-commerce détectée',
    found: hasEcommercePlatform,
    detail: hasEcommercePlatform
      ? `Plateforme(s) : ${detectedPlatforms.map(p => p.name).join(', ')}. Ces plateformes supportent nativement Google Merchant Center.`
      : 'Aucune plateforme e-commerce connue détectée (Shopify, WooCommerce, PrestaShop, etc.).',
    weight: 15,
  });

  // ── Signal 5: Cart/checkout indicators on homepage ──
  const cartPatterns = /add.to.cart|ajouter.au.panier|buy.now|acheter|panier|cart|checkout|caisse/i;
  const pricePatterns = /€\s*\d|USD\s*\d|\$\s*\d|£\s*\d|prix|price/i;
  const hasCartIndicators = cartPatterns.test(html) && pricePatterns.test(html);
  
  signals.push({
    signal: 'Indicateurs panier/prix',
    found: hasCartIndicators,
    detail: hasCartIndicators
      ? 'Boutons d\'achat et prix détectés sur la page. Confirme une activité e-commerce.'
      : 'Aucun indicateur de panier ou de prix détecté sur la page analysée.',
    weight: 10,
  });

  // ── Signal 6: Scrape 2-3 product pages for deeper analysis ──
  let productPagesScraped = 0;
  if (hasProductUrls && apiKey) {
    const pagesToScrape = productUrls.slice(0, 3);
    console.log(`Scraping ${pagesToScrape.length} product pages for Merchant detection...`);
    
    const scrapePromises = pagesToScrape.map(async (pUrl) => {
      try {
        const resp = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: pUrl, formats: ['html'], onlyMainContent: false }),
        });
        
        if (!resp.ok) return null;
        const data = await resp.json();
        const pageHtml = data.data?.html || data.html || '';
        return pageHtml;
      } catch {
        return null;
      }
    });

    const scrapedPages = await Promise.all(scrapePromises);
    
    for (const pageHtml of scrapedPages) {
      if (!pageHtml) continue;
      productPagesScraped++;
      
      const pageProducts = extractProductsFromHtml(pageHtml);
      products.push(...pageProducts);
      
      // Also check for gtag on product pages
      const pageGtag = gtagPatterns.filter(p => p.pattern.test(pageHtml));
      if (pageGtag.length > 0 && !hasGtagShopping) {
        signals[2].found = true;
        signals[2].detail = `Événements détectés sur pages produit : ${pageGtag.map(e => e.name).join(', ')}.`;
      }
    }
  }

  signals.push({
    signal: 'Données produit sur sous-pages',
    found: productPagesScraped > 0 && products.length > homepageProducts.length,
    detail: productPagesScraped > 0
      ? `${productPagesScraped} page(s) produit scannées. ${products.length - homepageProducts.length} produit(s) supplémentaires trouvés.`
      : hasProductUrls
        ? 'Des URLs produit existent mais n\'ont pas pu être scannées.'
        : 'Aucune page produit à scanner.',
    weight: 10,
  });

  // ── Calculate confidence score ──
  let totalWeight = 0;
  let earnedWeight = 0;
  for (const sig of signals) {
    totalWeight += sig.weight;
    if (sig.found) earnedWeight += sig.weight;
  }
  const merchantConfidence = Math.round((earnedWeight / totalWeight) * 100);

  // ── Determine if it's a product site ──
  const isProductPage = structuredDataFound || hasProductUrls || hasCartIndicators || hasEcommercePlatform;
  
  // ── Generate issues for products ──
  if (isProductPage && !structuredDataFound) {
    issues.push({ issue: 'Missing product structured data', impact: 'Google Merchant cannot extract product information.', fix: 'Add JSON-LD structured data of type "Product".', priority: 'High' });
  }
  
  products.forEach((product, index) => {
    const prefix = products.length > 1 ? `Product ${index + 1}: ` : '';
    if (!product.price) issues.push({ issue: `${prefix}Missing price`, impact: 'Required for Google Shopping.', fix: 'Add "offers.price".', priority: 'High' });
    if (!product.currency) issues.push({ issue: `${prefix}Missing currency`, impact: 'Price not interpretable.', fix: 'Add "offers.priceCurrency".', priority: 'High' });
    if (!product.availability) issues.push({ issue: `${prefix}Missing availability`, impact: 'Required for display.', fix: 'Add "offers.availability".', priority: 'High' });
    if (!product.gtin && !product.mpn) issues.push({ issue: `${prefix}Missing GTIN/MPN`, impact: 'Identifier required.', fix: 'Add "gtin" or "mpn".', priority: 'Medium' });
    if (!product.brand) issues.push({ issue: `${prefix}Missing brand`, impact: 'Improves visibility.', fix: 'Add "brand".', priority: 'Medium' });
    if (!product.image) issues.push({ issue: `${prefix}Missing image`, impact: 'Required for Google Shopping.', fix: 'Add "image".', priority: 'High' });
    if (!product.description || product.description.length < 50) issues.push({ issue: `${prefix}Short description`, impact: 'Improves SEO ranking.', fix: 'Add min 150 characters.', priority: 'Medium' });
    if (!product.shipping) issues.push({ issue: `${prefix}Missing shipping info`, impact: 'Optional but recommended.', fix: 'Configure in Merchant Center.', priority: 'Low' });
  });
  
  if (isProductPage) {
    feedRecommendations.push(
      '📋 To submit your products to Google Merchant Center:',
      '1. Create a Merchant Center account at merchants.google.com',
      '2. Verify and claim your website',
      '3. Download the CSV feed generated by SKAL IA below',
      '4. Import it under Products → Feeds → New feed',
      '5. Fix errors flagged by Merchant Center',
      '6. Enable free Shopping listings'
    );
    
    if (products.length > 0) {
      feedRecommendations.push('', `✅ ${products.length} product(s) detected and included in the feed`);
    }
  }
  
  return { 
    isProductPage, products, issues, structuredDataFound, feedRecommendations,
    merchantSignals: signals,
    merchantConfidence,
    productPagesFound: productUrls.length,
    compliance: null, // Will be filled after if isProductPage
  };
}

// ─── Merchant Compliance Check (Deep Content Analysis) ───────────────

async function checkMerchantCompliance(
  html: string,
  allSiteUrls: string[],
  merchantAnalysis: { products: ProductData[]; structuredDataFound: boolean },
  apiKey: string
): Promise<MerchantCompliance> {
  const checks: MerchantComplianceCheck[] = [];
  const missingCritical: string[] = [];
  const recommendations: string[] = [];

  // Define policy pages with AI analysis prompts
  const policyPages = [
    {
      name: 'Politique de retour/remboursement',
      category: 'policy' as const,
      urlPatterns: /\/(return|refund|retour|remboursement|returns|politique-de-retour|return-policy|refund-policy)/i,
      htmlPatterns: /politique\s*(de\s*)?(retour|remboursement)|return\s*policy|refund\s*policy|retour\s*et\s*remboursement/i,
      aiPrompt: `Analyze this return/refund policy for Google Merchant Center. Check: 1) Clear return window (14/30 days)? 2) Return conditions described? 3) Refund method explained? 4) Return process described? 5) Exceptions stated? Respond ONLY in JSON: {"valid":true/false,"issues":["issue1"],"summary":"one sentence"}`,
      critical: true,
    },
    {
      name: 'Politique de livraison',
      category: 'policy' as const,
      urlPatterns: /\/(shipping|livraison|delivery|expedition|frais-de-port|shipping-policy)/i,
      htmlPatterns: /politique\s*(de\s*)?livraison|shipping\s*(policy|info)|frais\s*de\s*(port|livraison)|delivery\s*(policy|info)/i,
      aiPrompt: `Analyze this shipping policy for Google Merchant Center. Check: 1) Shipping costs stated? 2) Delivery timeframes specified? 3) Shipping regions listed? 4) Multiple shipping methods? 5) Tracking mentioned? Respond ONLY in JSON: {"valid":true/false,"issues":["issue1"],"summary":"one sentence"}`,
      critical: true,
    },
    {
      name: 'CGV / Conditions générales',
      category: 'policy' as const,
      urlPatterns: /\/(terms|cgv|conditions|tos|terms-of-service|conditions-generales|mentions-legales|legal)/i,
      htmlPatterns: /conditions\s*g[eé]n[eé]rales|terms\s*(of\s*)?service|terms\s*(&|and)\s*conditions|mentions\s*l[eé]gales|cgv/i,
      aiPrompt: `Analyze these terms of service for Google Merchant Center. Check: 1) Business entity identified? 2) Payment terms described? 3) Liability limitation addressed? 4) Dispute resolution mentioned? 5) Applicable law stated? Respond ONLY in JSON: {"valid":true/false,"issues":["issue1"],"summary":"one sentence"}`,
      critical: true,
    },
    {
      name: 'Page de contact',
      category: 'trust' as const,
      urlPatterns: /\/(contact|contactez|nous-contacter|contact-us|support)/i,
      htmlPatterns: /contactez.nous|contact\s*us|nous\s*contacter|formulaire\s*de\s*contact/i,
      aiPrompt: `Analyze this contact page for Google Merchant Center. Check: 1) Physical address provided? 2) Email address provided? 3) Phone number provided? 4) Contact form present? 5) Business hours mentioned? Respond ONLY in JSON: {"valid":true/false,"issues":["issue1"],"summary":"one sentence"}`,
      critical: true,
    },
    {
      name: 'Politique de confidentialité',
      category: 'policy' as const,
      urlPatterns: /\/(privacy|confidentialite|politique-de-confidentialite|privacy-policy|donnees-personnelles|rgpd|gdpr)/i,
      htmlPatterns: /politique\s*(de\s*)?confidentialit[eé]|privacy\s*policy|donn[eé]es\s*personnelles|rgpd|gdpr/i,
      aiPrompt: `Analyze this privacy policy for Google Merchant Center / GDPR. Check: 1) Data collection described? 2) Purpose of processing explained? 3) User rights mentioned (access, deletion)? 4) Cookie usage addressed? 5) Third-party sharing disclosed? Respond ONLY in JSON: {"valid":true/false,"issues":["issue1"],"summary":"one sentence"}`,
      critical: true,
    },
  ];

  // Step 1: Find URLs for each policy page
  const policyDetections = policyPages.map(page => {
    const matchedUrl = allSiteUrls.find(u => page.urlPatterns.test(u.toLowerCase()));
    const foundInHtml = page.htmlPatterns.test(html);
    return { page, url: matchedUrl || null, foundInHtml };
  });

  // Step 2: Scrape detected policy pages in parallel
  const pagesToScrape = policyDetections.filter(d => d.url);
  console.log(`Merchant compliance: scraping ${pagesToScrape.length} policy pages for content analysis...`);
  
  const scrapeResults = await Promise.all(
    pagesToScrape.map(async (detection) => {
      try {
        const resp = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: detection.url, formats: ['markdown'], onlyMainContent: true }),
        });
        if (!resp.ok) return { url: detection.url!, markdown: null };
        const data = await resp.json();
        return { url: detection.url!, markdown: data.data?.markdown || data.markdown || null };
      } catch {
        return { url: detection.url!, markdown: null };
      }
    })
  );

  // Step 3: Analyze scraped content with AI
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  const aiResults = await Promise.all(
    policyDetections.map(async (detection) => {
      const scraped = scrapeResults.find(s => s.url === detection.url);
      const markdown = scraped?.markdown;
      
      if (!markdown || !lovableApiKey) {
        return { contentAnalyzed: false, contentValid: null as boolean | null, contentIssues: [] as string[], summary: null as string | null };
      }

      try {
        const contentPreview = markdown.substring(0, 3000);
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{ role: 'user', content: `${detection.page.aiPrompt}\n\nPage content:\n${contentPreview}` }],
            max_tokens: 400,
          }),
        });

        if (!response.ok) {
          return { contentAnalyzed: false, contentValid: null as boolean | null, contentIssues: [] as string[], summary: null as string | null };
        }

        const aiData = await response.json();
        const aiContent = aiData.choices?.[0]?.message?.content || '';
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            contentAnalyzed: true,
            contentValid: parsed.valid === true,
            contentIssues: (parsed.issues || []) as string[],
            summary: (parsed.summary || null) as string | null,
          };
        }
        return { contentAnalyzed: false, contentValid: null as boolean | null, contentIssues: [] as string[], summary: null as string | null };
      } catch (error) {
        console.error(`AI compliance analysis error for ${detection.url}:`, error);
        return { contentAnalyzed: false, contentValid: null as boolean | null, contentIssues: [] as string[], summary: null as string | null };
      }
    })
  );

  // Step 4: Build compliance checks with content verdicts
  for (let i = 0; i < policyDetections.length; i++) {
    const detection = policyDetections[i];
    const ai = aiResults[i];
    const hasPage = !!detection.url || detection.foundInHtml;

    let detail: string;
    if (!hasPage) {
      detail = `Aucune page trouvée. ${detection.page.critical ? 'Obligatoire pour Merchant Center.' : 'Recommandé.'}`;
    } else if (ai.contentAnalyzed && ai.contentValid) {
      detail = `✅ Contenu analysé et conforme aux exigences Google. ${ai.summary || ''}`;
    } else if (ai.contentAnalyzed && !ai.contentValid) {
      detail = `⚠️ Page trouvée mais contenu insuffisant. ${ai.summary || ''} Problème(s) : ${ai.contentIssues.join(' • ')}`;
    } else {
      detail = `Page détectée mais contenu non analysé (scraping échoué ou page inaccessible).`;
    }

    checks.push({
      name: detection.page.name,
      found: hasPage,
      pageUrl: detection.url,
      contentAnalyzed: ai.contentAnalyzed,
      contentValid: ai.contentValid,
      contentIssues: ai.contentIssues,
      detail,
      category: detection.page.category,
    });

    if (!hasPage && detection.page.critical) {
      missingCritical.push(detection.page.name);
    }
  }

  // Product quality checks
  const products = merchantAnalysis.products;
  const productsWithImages = products.filter(p => p.image);
  const allHaveImages = products.length > 0 && productsWithImages.length === products.length;
  checks.push({
    name: 'Images produits',
    found: allHaveImages,
    pageUrl: null,
    contentAnalyzed: products.length > 0,
    contentValid: allHaveImages,
    contentIssues: !allHaveImages && products.length > 0 ? [`${products.length - productsWithImages.length} produit(s) sans image`] : [],
    detail: products.length === 0
      ? 'Aucun produit détecté.'
      : allHaveImages
        ? `${productsWithImages.length}/${products.length} ont une image. Vérifiez : min 100x100px, fond blanc, sans watermark.`
        : `${productsWithImages.length}/${products.length} ont une image. Manquantes = refus.`,
    category: 'product_quality',
  });

  const productsWithPrice = products.filter(p => p.price && p.currency);
  const allHavePrices = products.length > 0 && productsWithPrice.length === products.length;
  checks.push({
    name: 'Prix et devise',
    found: allHavePrices,
    pageUrl: null,
    contentAnalyzed: products.length > 0,
    contentValid: allHavePrices,
    contentIssues: !allHavePrices && products.length > 0 ? [`${products.length - productsWithPrice.length} sans prix/devise`] : [],
    detail: products.length === 0
      ? 'Aucun produit détecté.'
      : allHavePrices
        ? `${productsWithPrice.length}/${products.length} ont un prix complet.`
        : `${productsWithPrice.length}/${products.length} ont un prix complet. Manquants = refus.`,
    category: 'product_quality',
  });

  // GTIN / Identifiant produit
  const productsWithGTIN = products.filter(p => p.gtin || (p.mpn && p.brand));
  const allHaveIdentifiers = products.length > 0 && productsWithGTIN.length === products.length;
  checks.push({
    name: 'GTIN / Identifiant produit',
    found: allHaveIdentifiers,
    pageUrl: null,
    contentAnalyzed: products.length > 0,
    contentValid: allHaveIdentifiers,
    contentIssues: !allHaveIdentifiers && products.length > 0 
      ? [`${products.length - productsWithGTIN.length} produit(s) sans GTIN ni couple MPN+marque`] 
      : [],
    detail: products.length === 0
      ? 'Aucun produit détecté.'
      : allHaveIdentifiers
        ? `${productsWithGTIN.length}/${products.length} ont un identifiant (GTIN ou MPN+marque). Obligatoire pour Google Shopping.`
        : `${productsWithGTIN.length}/${products.length} ont un identifiant. Google exige GTIN (EAN/UPC) ou MPN+marque pour chaque produit.`,
    category: 'product_quality',
  });

  // Disponibilité produit
  const productsWithAvailability = products.filter(p => p.availability);
  const allHaveAvailability = products.length > 0 && productsWithAvailability.length === products.length;
  checks.push({
    name: 'Disponibilité produit',
    found: allHaveAvailability,
    pageUrl: null,
    contentAnalyzed: products.length > 0,
    contentValid: allHaveAvailability,
    contentIssues: !allHaveAvailability && products.length > 0 
      ? [`${products.length - productsWithAvailability.length} produit(s) sans statut de disponibilité (InStock/OutOfStock)`] 
      : [],
    detail: products.length === 0
      ? 'Aucun produit détecté.'
      : allHaveAvailability
        ? `${productsWithAvailability.length}/${products.length} ont un statut de disponibilité conforme.`
        : `${productsWithAvailability.length}/${products.length} ont un statut. Obligatoire : InStock, OutOfStock, PreOrder, etc.`,
    category: 'product_quality',
  });

  // HTTPS / SSL
  const siteUrl = allSiteUrls[0] || '';
  const isHttps = siteUrl.startsWith('https://');
  const hasSSL = /https:\/\//i.test(html);
  checks.push({
    name: 'HTTPS / SSL obligatoire',
    found: isHttps,
    pageUrl: null,
    contentAnalyzed: true,
    contentValid: isHttps,
    contentIssues: !isHttps ? ['Le site n\'utilise pas HTTPS. Obligatoire pour Merchant Center.'] : [],
    detail: isHttps 
      ? 'Site en HTTPS. Vérifiez que toutes les pages produits et le checkout sont aussi en HTTPS.'
      : 'Site non HTTPS. Google Merchant Center exige HTTPS sur toutes les pages, surtout le checkout.',
    category: 'technical',
  });

  // Informations vendeur / identité légale
  const legalPatterns = /\/(about|a-propos|qui-sommes-nous|mentions-legales|legal|imprint|impressum|about-us)/i;
  const hasLegalPage = allSiteUrls.some(u => legalPatterns.test(u.toLowerCase()));
  const hasBusinessInfo = /siret|siren|tva|vat|rcs|n°\s*(de\s*)?(siret|siren|tva)|company\s*registration|business\s*registration/i.test(html);
  const hasAddress = /<address|itemprop=["']address/i.test(html) || /\d{5}\s+[A-Za-zÀ-ÿ]+|street|rue\s+/i.test(html);
  checks.push({
    name: 'Informations vendeur',
    found: hasLegalPage || hasBusinessInfo || hasAddress,
    pageUrl: allSiteUrls.find(u => legalPatterns.test(u.toLowerCase())) || null,
    contentAnalyzed: true,
    contentValid: hasBusinessInfo && hasAddress,
    contentIssues: [
      ...(!hasBusinessInfo ? ['Aucun numéro d\'identification légale détecté (SIRET, TVA, RCS)'] : []),
      ...(!hasAddress ? ['Aucune adresse physique détectée'] : []),
      ...(!hasLegalPage ? ['Aucune page "À propos" ou mentions légales trouvée'] : []),
    ].filter(Boolean),
    detail: hasBusinessInfo && hasAddress
      ? 'Identité légale et adresse physique détectées. Google exige ces informations pour valider un vendeur.'
      : 'Google exige une identité vérifiable : nom d\'entreprise, adresse physique, numéro d\'enregistrement.',
    category: 'identity',
  });

  // Cohérence devise / pays cible
  const currencies = [...new Set(products.map(p => p.currency).filter(Boolean))];
  const hasConsistentCurrency = currencies.length <= 1;
  checks.push({
    name: 'Cohérence devise',
    found: currencies.length > 0,
    pageUrl: null,
    contentAnalyzed: products.length > 0,
    contentValid: hasConsistentCurrency && currencies.length > 0,
    contentIssues: currencies.length > 1 
      ? [`${currencies.length} devises détectées (${currencies.join(', ')}). Doit être cohérent avec le pays cible.`] 
      : [],
    detail: currencies.length === 0
      ? 'Aucune devise détectée dans les produits.'
      : hasConsistentCurrency
        ? `Devise unique détectée : ${currencies[0]}. Assurez-vous qu\'elle correspond à votre pays cible Merchant Center.`
        : `Devises multiples détectées : ${currencies.join(', ')}. Google exige une devise cohérente par flux.`,
    category: 'product_quality',
  });

  // Paiement sécurisé + moyens de paiement
  const checkoutPatterns = /\/(checkout|commande|paiement|order|panier|cart)/i;
  const hasCheckout = allSiteUrls.some(u => checkoutPatterns.test(u.toLowerCase()));
  const paymentMethodsPattern = /visa|mastercard|paypal|stripe|carte\s*(bancaire|de\s*crédit)|credit\s*card|apple\s*pay|google\s*pay|klarna|bancontact|ideal|sepa/gi;
  const paymentMethodsFound = html.match(paymentMethodsPattern) || [];
  const uniquePaymentMethods = [...new Set(paymentMethodsFound.map(m => m.toLowerCase()))];
  checks.push({
    name: 'Paiement sécurisé',
    found: hasCheckout || uniquePaymentMethods.length > 0,
    pageUrl: null,
    contentAnalyzed: true,
    contentValid: hasCheckout && isHttps,
    contentIssues: [
      ...(!hasCheckout ? ['Aucune page de checkout/paiement détectée'] : []),
      ...(!isHttps ? ['Le paiement doit impérativement être en HTTPS'] : []),
      ...(uniquePaymentMethods.length === 0 ? ['Aucun moyen de paiement détecté (Visa, PayPal, etc.)'] : []),
    ].filter(Boolean),
    detail: uniquePaymentMethods.length > 0
      ? `Moyens de paiement détectés : ${uniquePaymentMethods.join(', ')}. ${hasCheckout ? 'Page checkout trouvée.' : 'Pas de page checkout identifiée.'}`
      : hasCheckout ? 'Page checkout détectée mais aucun moyen de paiement identifié.' : 'Aucune page de paiement ni moyen de paiement détecté.',
    category: 'trust',
  });

  // Score: content-aware
  let passedScore = 0;
  for (const check of checks) {
    if (check.found && check.contentAnalyzed && check.contentValid) {
      passedScore += 1;
    } else if (check.found && check.contentAnalyzed && !check.contentValid) {
      passedScore += 0.5;
    } else if (check.found) {
      passedScore += 0.7;
    }
  }
  const score = Math.round((passedScore / checks.length) * 100);

  // Recommendations
  const contentFailures = checks.filter(c => c.contentAnalyzed && !c.contentValid);
  if (missingCritical.length > 0) {
    recommendations.push(`🚫 ${missingCritical.length} page(s) obligatoire(s) manquante(s) : ${missingCritical.join(', ')}. Refus garanti.`);
  }
  if (contentFailures.length > 0) {
    recommendations.push(`⚠️ ${contentFailures.length} page(s) avec contenu insuffisant : ${contentFailures.map(c => c.name).join(', ')}. Corrigez avant soumission.`);
    contentFailures.forEach(c => {
      if (c.contentIssues.length > 0) {
        recommendations.push(`  → ${c.name} : ${c.contentIssues.join(' • ')}`);
      }
    });
  }
  if (!allHaveImages && products.length > 0) {
    recommendations.push('📸 Images manquantes. Min 100x100px, fond blanc, sans watermark.');
  }
  if (!allHavePrices && products.length > 0) {
    recommendations.push('💰 Prix/devise manquants sur certains produits.');
  }
  if (missingCritical.length === 0 && contentFailures.length === 0 && score >= 90) {
    recommendations.push('✅ Conformité excellente ! Fortes chances d\'approbation par Google Merchant Center.');
  }

  return { checks, score, missingCritical, recommendations };
}

// Helper: extract Product JSON-LD from raw HTML
function extractProductsFromHtml(html: string): ProductData[] {
  const products: ProductData[] = [];
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(match[1]);
      const items = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      for (const item of items) {
        if (item['@type'] === 'Product' || item['@type']?.includes('Product')) {
          products.push({
            name: item.name || null,
            price: item.offers?.price || item.offers?.[0]?.price || null,
            currency: item.offers?.priceCurrency || item.offers?.[0]?.priceCurrency || null,
            availability: item.offers?.availability || item.offers?.[0]?.availability || null,
            description: item.description || null,
            image: Array.isArray(item.image) ? item.image[0] : item.image || null,
            gtin: item.gtin || item.gtin13 || item.gtin12 || item.gtin8 || item.isbn || null,
            mpn: item.mpn || null,
            brand: typeof item.brand === 'string' ? item.brand : item.brand?.name || null,
            sku: item.sku || null,
            condition: item.itemCondition || null,
            shipping: !!item.offers?.shippingDetails || false,
            rating: item.aggregateRating ? {
              value: item.aggregateRating.ratingValue || null,
              count: item.aggregateRating.reviewCount || item.aggregateRating.ratingCount || null,
            } : null,
          });
        }
      }
    } catch (e) {
      // Skip invalid JSON-LD
    }
  }
  return products;
}

function extractPerformanceInfo(html: string) {
  return {
    hasLazyLoading: /loading=["']lazy["']/i.test(html),
    hasViewportMeta: /<meta[^>]*name=["']viewport["']/i.test(html),
  };
}

function generateIssues(
  meta: ReturnType<typeof extractMetaInfo>,
  robotsTxt: Awaited<ReturnType<typeof checkRobotsTxt>>,
  sitemap: Awaited<ReturnType<typeof checkSitemap>>,
  performance: ReturnType<typeof extractPerformanceInfo>,
  url: string,
  brokenLinks: BrokenLink[],
  contentAnalysis: ContentAnalysis,
  hreflangAnalysis: HreflangAnalysis,
  merchantAnalysis: MerchantAnalysis,
  imageAnalysis: { total: number; withoutAlt: number; withoutAlt_list: string[] },
  headingAnalysis: { total: number; hierarchy: string[]; issues: string[] },
  securityHeaders: { https: boolean; hsts: boolean; xFrameOptions: boolean; csp: boolean; xContentType: boolean },
  pageSpeed: PageSpeedResult,
  redirectAnalysis: RedirectAnalysis,
  schemaOrgAnalysis: SchemaOrgAnalysis
): SEOIssue[] {
  const issues: SEOIssue[] = [];
  let issueId = 1;

  if (!meta.title) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Missing page title', impact: 'Google uses the title as the link in search results.', fix: 'Add a <title> tag under 60 characters.', priority: 'High', category: 'Meta Tags', fixType: 'automated' });
  } else if (meta.title.length > 60) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Title too long', impact: `Truncated in results (${meta.title.length} chars).`, fix: 'Shorten to under 60 characters.', priority: 'Medium', category: 'Meta Tags', fixType: 'automated' });
  }

  if (!meta.description) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Missing meta description', impact: 'Google generates an automatic snippet.', fix: 'Add a meta description of 150-160 characters.', priority: 'High', category: 'Meta Tags', fixType: 'automated' });
  } else if (meta.description.length > 160) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Meta description too long', impact: `Truncated (${meta.description.length} chars).`, fix: 'Shorten to under 160 characters.', priority: 'Low', category: 'Meta Tags', fixType: 'automated' });
  }

  if (!meta.hasH1) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Missing H1 tag', impact: 'Search engines cannot identify the main topic.', fix: 'Add an H1 tag with your target keyword.', priority: 'High', category: 'Structure', fixType: 'manual' });
  } else if (meta.h1Count > 1) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Multiple H1 tags', impact: `${meta.h1Count} H1s found, keep only one.`, fix: 'Use H2-H6 for subheadings.', priority: 'Medium', category: 'Structure', fixType: 'manual' });
  }

  if (!meta.language) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Language not declared', impact: 'Poor language-based indexing.', fix: 'Add lang="fr" to <html>.', priority: 'Medium', category: 'Internationalization', fixType: 'manual' });
  }

  if (!robotsTxt.found) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Missing robots.txt', impact: 'Crawlers may crawl unnecessary pages.', fix: 'Deploy the robots.txt generated by SKAL IA.', priority: 'Medium', category: 'Crawling', fixType: 'automated' });
  } else if (robotsTxt.blocksGooglebot) {
    issues.push({ id: `issue-${issueId++}`, issue: 'robots.txt blocks crawlers', impact: 'Your pages will not be indexed.', fix: 'Fix the Disallow directives.', priority: 'High', category: 'Crawling', fixType: 'semi-automated' });
  }

  if (!sitemap.found) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Missing XML Sitemap', impact: 'Pages may not be indexed.', fix: 'Deploy the sitemap generated by SKAL IA.', priority: 'Medium', category: 'Crawling', fixType: 'automated' });
  } else if (!sitemap.isValid) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Invalid sitemap', impact: 'Google cannot read it.', fix: 'Verify the XML structure.', priority: 'High', category: 'Crawling', fixType: 'semi-automated' });
  }

  if (!meta.canonical) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Missing canonical URL', impact: 'Risk of duplicate content.', fix: 'Add <link rel="canonical">.', priority: 'Low', category: 'Technical SEO', fixType: 'automated' });
  }

  if (!meta.hasOgTags) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Missing Open Graph tags', impact: 'No rich preview on social media.', fix: 'Add og:title, og:description, og:image.', priority: 'Low', category: 'Social Media', fixType: 'automated' });
  }

  if (!meta.hasTwitterCards) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Missing Twitter Cards', impact: 'No preview on Twitter/X.', fix: 'Add twitter:card, twitter:title.', priority: 'Low', category: 'Social Media', fixType: 'automated' });
  }

  if (!performance.hasViewportMeta) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Missing viewport meta', impact: 'Poor mobile display.', fix: 'Add <meta name="viewport">.', priority: 'High', category: 'Mobile', fixType: 'manual' });
  }

  if (meta.robots && (meta.robots.includes('noindex') || meta.robots.includes('nofollow'))) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Page set to noindex/nofollow', impact: 'Page not indexed by Google.', fix: 'Remove the directive if indexing is desired.', priority: 'High', category: 'Indexability', fixType: 'manual' });
  }

  if (brokenLinks.length > 0) {
    issues.push({ id: `issue-${issueId++}`, issue: `${brokenLinks.length} broken link(s)`, impact: 'Hurts UX and SEO.', fix: `Fix: ${brokenLinks.slice(0, 3).map(l => l.url).join(', ')}`, priority: 'Medium', category: 'Links', fixType: 'manual' });
  }

  if (contentAnalysis.wordCount < 300) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Content too thin', impact: `${contentAnalysis.wordCount} words, aim for 300+.`, fix: 'Add relevant, valuable content.', priority: 'Medium', category: 'Content', fixType: 'manual' });
  }

  if (contentAnalysis.readabilityScore < 50) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Low readability', impact: `Score: ${contentAnalysis.readabilityScore}/100.`, fix: 'Simplify sentences and structure.', priority: 'Low', category: 'Content', fixType: 'manual' });
  }

  if (contentAnalysis.duplicateContent.length > 0) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Duplicate content detected', impact: `${contentAnalysis.duplicateContent.length} repeated section(s).`, fix: 'Vary your content.', priority: 'Medium', category: 'Content', fixType: 'manual' });
  }

  hreflangAnalysis.issues.forEach(issue => {
    issues.push({ id: `issue-${issueId++}`, issue, impact: 'Wrong language version served.', fix: hreflangAnalysis.recommendations[0] || 'Check hreflang tags.', priority: 'Medium', category: 'Internationalization', fixType: 'manual' });
  });

  if (merchantAnalysis.isProductPage) {
    merchantAnalysis.issues.forEach(mi => {
      issues.push({ id: `issue-${issueId++}`, issue: mi.issue, impact: mi.impact, fix: mi.fix, priority: mi.priority, category: 'Google Merchant', fixType: 'manual' });
    });
  }

  // Image accessibility issues
  if (imageAnalysis.withoutAlt > 0) {
    issues.push({ id: `issue-${issueId++}`, issue: `${imageAnalysis.withoutAlt} image(s) missing alt text`, impact: 'Hurts accessibility and image SEO. Screen readers cannot describe these images.', fix: 'Add descriptive alt attributes to all <img> tags.', priority: imageAnalysis.withoutAlt > 5 ? 'High' : 'Medium', category: 'Accessibility', fixType: 'manual' });
  }

  // Heading hierarchy issues
  headingAnalysis.issues.forEach(hi => {
    issues.push({ id: `issue-${issueId++}`, issue: hi, impact: 'Poor heading hierarchy hurts content structure and SEO.', fix: 'Ensure headings follow a logical order (H1 → H2 → H3).', priority: 'Medium', category: 'Structure', fixType: 'manual' });
  });

  // Security issues
  if (!securityHeaders.https) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Site not using HTTPS', impact: 'Google penalizes non-HTTPS sites. User data is exposed.', fix: 'Install an SSL certificate and redirect HTTP to HTTPS.', priority: 'High', category: 'Security', fixType: 'manual' });
  }
  if (!securityHeaders.hsts && securityHeaders.https) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Missing HSTS header', impact: 'Browser may load HTTP version, enabling downgrade attacks.', fix: 'Add Strict-Transport-Security header.', priority: 'Low', category: 'Security', fixType: 'manual' });
  }
  if (!securityHeaders.xContentType) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Missing X-Content-Type-Options header', impact: 'Browser MIME sniffing can lead to XSS attacks.', fix: 'Add X-Content-Type-Options: nosniff header.', priority: 'Low', category: 'Security', fixType: 'manual' });
  }

  // PageSpeed performance issues
  if (pageSpeed.performanceScore !== null && pageSpeed.performanceScore < 50) {
    issues.push({ id: `issue-${issueId++}`, issue: `Poor performance score (${pageSpeed.performanceScore}/100)`, impact: 'Google uses Core Web Vitals as a ranking factor.', fix: 'Optimize images, reduce JavaScript, enable caching.', priority: 'High', category: 'Performance', fixType: 'manual' });
  } else if (pageSpeed.performanceScore !== null && pageSpeed.performanceScore < 90) {
    issues.push({ id: `issue-${issueId++}`, issue: `Performance needs improvement (${pageSpeed.performanceScore}/100)`, impact: 'Moderate impact on Core Web Vitals ranking signal.', fix: 'Check PageSpeed diagnostics for specific optimizations.', priority: 'Medium', category: 'Performance', fixType: 'manual' });
  }
  if (pageSpeed.lcp.rating === 'poor') {
    issues.push({ id: `issue-${issueId++}`, issue: 'Poor LCP (Largest Contentful Paint)', impact: `LCP: ${pageSpeed.lcp.value ? (pageSpeed.lcp.value / 1000).toFixed(1) + 's' : 'N/A'}. Should be under 2.5s.`, fix: 'Optimize largest visible element loading: compress images, use CDN, preload critical resources.', priority: 'High', category: 'Performance', fixType: 'manual' });
  }
  if (pageSpeed.cls.rating === 'poor') {
    issues.push({ id: `issue-${issueId++}`, issue: 'Poor CLS (Cumulative Layout Shift)', impact: `CLS: ${pageSpeed.cls.value?.toFixed(3) ?? 'N/A'}. Should be under 0.1.`, fix: 'Set explicit dimensions on images/videos, avoid inserting content above existing content.', priority: 'High', category: 'Performance', fixType: 'manual' });
  }

  // Redirect issues
  if (redirectAnalysis.hasRedirectLoop) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Redirect loop detected', impact: 'Crawlers cannot reach the page. Users see an error.', fix: 'Fix the redirect configuration to eliminate the loop.', priority: 'High', category: 'Crawling', fixType: 'manual' });
  }
  if (redirectAnalysis.totalRedirects > 2) {
    issues.push({ id: `issue-${issueId++}`, issue: `Long redirect chain (${redirectAnalysis.totalRedirects} redirects)`, impact: 'Each redirect adds latency and wastes crawl budget.', fix: 'Reduce to a single redirect from origin to final destination.', priority: 'Medium', category: 'Crawling', fixType: 'manual' });
  }
  const has302 = redirectAnalysis.chain.some(r => r.statusCode === 302);
  if (has302) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Temporary redirect (302) used instead of 301', impact: '302 redirects do not pass full link equity to the destination.', fix: 'Change to 301 (permanent) redirect if the move is permanent.', priority: 'Medium', category: 'Technical SEO', fixType: 'manual' });
  }

  // Schema.org issues
  schemaOrgAnalysis.types.forEach(schema => {
    if (!schema.valid && schema.issues.length > 0) {
      issues.push({
        id: `issue-${issueId++}`,
        issue: `Schema.org ${schema.type}: ${schema.issues[0]}`,
        impact: `Invalid structured data prevents rich results for ${schema.type}.`,
        fix: schema.issues.length > 1 ? `Fix ${schema.issues.length} issues: ${schema.issues.slice(0, 3).join('; ')}` : schema.issues[0],
        priority: schema.type === 'Product' ? 'High' : 'Medium',
        category: 'Structured Data',
        fixType: 'manual',
      });
    }
  });
  if (schemaOrgAnalysis.totalFound === 0) {
    issues.push({ id: `issue-${issueId++}`, issue: 'No Schema.org structured data found', impact: 'No eligibility for rich results (stars, FAQ, breadcrumbs, etc.).', fix: 'Add JSON-LD structured data (WebSite, Organization, BreadcrumbList at minimum).', priority: 'Medium', category: 'Structured Data', fixType: 'semi-automated' });
  }

  return issues;
}

// ─── Image Accessibility Analysis ────────────────────────────────────

function analyzeImages(html: string): { total: number; withoutAlt: number; withoutAlt_list: string[] } {
  const imgRegex = /<img[^>]*>/gi;
  const images = html.match(imgRegex) || [];
  const withoutAlt_list: string[] = [];

  images.forEach(img => {
    const hasAlt = /alt=["'][^"']*["']/i.test(img);
    const hasEmptyAlt = /alt=["']\s*["']/i.test(img);
    if (!hasAlt || hasEmptyAlt) {
      const srcMatch = img.match(/src=["']([^"']+)["']/i);
      if (srcMatch) withoutAlt_list.push(srcMatch[1].substring(0, 80));
    }
  });

  return { total: images.length, withoutAlt: withoutAlt_list.length, withoutAlt_list };
}

// ─── Heading Hierarchy Analysis ──────────────────────────────────────

function analyzeHeadingHierarchy(html: string): { total: number; hierarchy: string[]; issues: string[] } {
  const headingRegex = /<(h[1-6])[^>]*>/gi;
  const headings: string[] = [];
  const issues: string[] = [];
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    headings.push(match[1].toLowerCase());
  }

  // Check hierarchy
  for (let i = 1; i < headings.length; i++) {
    const prev = parseInt(headings[i - 1].charAt(1));
    const curr = parseInt(headings[i].charAt(1));
    if (curr > prev + 1) {
      issues.push(`Heading hierarchy skip: ${headings[i - 1].toUpperCase()} → ${headings[i].toUpperCase()} (skipped H${prev + 1})`);
      break;
    }
  }

  if (headings.length > 0 && headings[0] !== 'h1') {
    issues.push(`First heading is ${headings[0].toUpperCase()} instead of H1`);
  }

  return { total: headings.length, hierarchy: headings, issues };
}

// ─── Security Headers Check ─────────────────────────────────────────

async function checkSecurityHeaders(url: string): Promise<{ https: boolean; hsts: boolean; xFrameOptions: boolean; csp: boolean; xContentType: boolean }> {
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000), redirect: 'follow' });
    const headers = response.headers;

    return {
      https: url.startsWith('https://'),
      hsts: !!headers.get('strict-transport-security'),
      xFrameOptions: !!headers.get('x-frame-options'),
      csp: !!headers.get('content-security-policy'),
      xContentType: !!headers.get('x-content-type-options'),
    };
  } catch (error) {
    console.error('Error checking security headers:', error);
    return { https: url.startsWith('https://'), hsts: false, xFrameOptions: false, csp: false, xContentType: false };
  }
}

// ─── Google PageSpeed Insights API ───────────────────────────────────

async function fetchPageSpeedInsights(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedResult> {
  try {
    console.log(`Fetching PageSpeed Insights (${strategy}) for:`, url);
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&strategy=${strategy}`;
    
    const response = await fetch(apiUrl, { signal: AbortSignal.timeout(30000) });
    
    if (!response.ok) {
      console.error(`PSI API error (${strategy}):`, response.status);
      return { performanceScore: null, lcp: { value: null, rating: null }, fid: { value: null, rating: null }, cls: { value: null, rating: null }, fcp: { value: null, rating: null }, si: { value: null, rating: null }, tbt: { value: null, rating: null }, ttfb: { value: null, rating: null }, diagnostics: [], fetchedAt: null, error: `API returned ${response.status}` };
    }

    const data = await response.json();
    const lighthouse = data.lighthouseResult;
    if (!lighthouse) {
      return { performanceScore: null, lcp: { value: null, rating: null }, fid: { value: null, rating: null }, cls: { value: null, rating: null }, fcp: { value: null, rating: null }, si: { value: null, rating: null }, tbt: { value: null, rating: null }, ttfb: { value: null, rating: null }, diagnostics: [], fetchedAt: null, error: 'No Lighthouse data' };
    }

    const audits = lighthouse.audits || {};
    const categories = lighthouse.categories || {};
    const perfScore = categories.performance?.score != null ? Math.round(categories.performance.score * 100) : null;

    const getMetric = (key: string) => {
      const audit = audits[key];
      if (!audit) return { value: null, rating: null };
      return { value: audit.numericValue ?? null, rating: audit.score != null ? (audit.score >= 0.9 ? 'good' : audit.score >= 0.5 ? 'needs-improvement' : 'poor') : null };
    };

    const diagnosticAudits = Object.values(audits)
      .filter((a: any) => a.details?.type === 'opportunity' || (a.score !== null && a.score < 0.9 && a.details))
      .slice(0, 8)
      .map((a: any) => ({ title: a.title || '', description: (a.description || '').replace(/\\[.*?\\]\\(.*?\\)/g, '').substring(0, 200), score: a.score ?? null }));

    const result: PageSpeedResult = {
      performanceScore: perfScore,
      lcp: getMetric('largest-contentful-paint'),
      fid: getMetric('max-potential-fid'),
      cls: getMetric('cumulative-layout-shift'),
      fcp: getMetric('first-contentful-paint'),
      si: getMetric('speed-index'),
      tbt: getMetric('total-blocking-time'),
      ttfb: getMetric('server-response-time'),
      diagnostics: diagnosticAudits,
      fetchedAt: new Date().toISOString(),
      error: null,
    };

    console.log(`PSI score (${strategy}):`, perfScore);
    return result;
  } catch (error) {
    console.error(`PageSpeed Insights error (${strategy}):`, error);
    return { performanceScore: null, lcp: { value: null, rating: null }, fid: { value: null, rating: null }, cls: { value: null, rating: null }, fcp: { value: null, rating: null }, si: { value: null, rating: null }, tbt: { value: null, rating: null }, ttfb: { value: null, rating: null }, diagnostics: [], fetchedAt: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
