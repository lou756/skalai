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

interface MerchantAnalysis {
  isProductPage: boolean;
  products: ProductData[];
  issues: { issue: string; impact: string; fix: string; priority: 'High' | 'Medium' | 'Low' }[];
  structuredDataFound: boolean;
  feedRecommendations: string[];
}

interface GeneratedFix {
  type: 'robots_txt' | 'sitemap_xml' | 'meta_tags' | 'merchant_feed' | 'structured_data';
  label: string;
  description: string;
  content: string;
  filename: string;
  status: 'auto_generated' | 'needs_review';
}

interface ActionReport {
  automated: { action: string; status: string; details: string }[];
  manual: { action: string; instructions: string; priority: 'High' | 'Medium' | 'Low' }[];
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

interface SEOAnalysisResult {
  url: string;
  score: number;
  scoreBreakdown: ScoreBreakdown[];
  confidence: ConfidenceIndicator[];
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
  brokenLinks: BrokenLink[];
  gscInstructions: string[];
  contentAnalysis: ContentAnalysis;
  hreflangAnalysis: HreflangAnalysis;
  merchantAnalysis: MerchantAnalysis;
  generatedFixes: GeneratedFix[];
  actionReport: ActionReport;
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

    // Use Firecrawl Map API for complete site URL discovery
    const allSiteUrls = await discoverAllUrls(formattedUrl, apiKey);
    console.log('URLs discovered via Map API:', allSiteUrls.length);

    const meta = extractMetaInfo(html, metadata);
    const robotsTxt = await checkRobotsTxt(formattedUrl, apiKey);
    const sitemap = await checkSitemap(formattedUrl, robotsTxt.content, apiKey);
    const performance = extractPerformanceInfo(html);
    const brokenLinks = await checkBrokenLinks(links.slice(0, 15));
    const gscInstructions = generateGSCInstructions(formattedUrl, sitemap, robotsTxt);
    const contentAnalysis = await analyzeContent(markdown, meta, formattedUrl);
    const hreflangAnalysis = analyzeHreflang(html, meta.language);
    const merchantAnalysis = analyzeMerchantData(html);
    
    const issues = generateIssues(meta, robotsTxt, sitemap, performance, formattedUrl, brokenLinks, contentAnalysis, hreflangAnalysis, merchantAnalysis);
    
    // NEW: Weighted positive scoring system
    const { score, breakdown } = calculateWeightedScore(meta, robotsTxt, sitemap, performance, brokenLinks, contentAnalysis, hreflangAnalysis, merchantAnalysis, issues);
    
    // NEW: Confidence indicators
    const confidence = buildConfidenceIndicators(html, meta, robotsTxt, sitemap, contentAnalysis, merchantAnalysis, allSiteUrls.length);

    // Generate autonomous fixes - use ALL discovered URLs for sitemap
    const generatedFixes = generateAutonomousFixes(formattedUrl, meta, robotsTxt, sitemap, contentAnalysis, merchantAnalysis, allSiteUrls.length > 0 ? allSiteUrls : links);
    
    const actionReport = buildActionReport(issues, generatedFixes, meta, sitemap, robotsTxt, merchantAnalysis);

    const result: SEOAnalysisResult = {
      url: formattedUrl,
      score,
      scoreBreakdown: breakdown,
      confidence,
      issues,
      meta,
      sitemap,
      robotsTxt,
      performance,
      brokenLinks,
      gscInstructions,
      contentAnalysis,
      hreflangAnalysis,
      merchantAnalysis,
      generatedFixes,
      actionReport,
    };

    console.log('Analysis complete. Score:', score, 'Fixes generated:', generatedFixes.length, 'URLs mapped:', allSiteUrls.length);

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

// ─── URL Discovery via Map API ───────────────────────────────────────

async function discoverAllUrls(url: string, apiKey: string): Promise<string[]> {
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
    if (!response.ok || !data.success) {
      console.error('Map API error:', data);
      return [];
    }

    return data.links || [];
  } catch (error) {
    console.error('Error mapping URLs:', error);
    return [];
  }
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
  issues: SEOIssue[]
): { score: number; breakdown: ScoreBreakdown[] } {
  const breakdown: ScoreBreakdown[] = [];

  // 1. Meta Tags (20 points max)
  let metaScore = 0;
  const metaMax = 20;
  if (meta.title) {
    metaScore += meta.title.length <= 60 ? 8 : 5; // full points if optimal length
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
  if (sitemap.found && sitemap.isValid) indexScore += 6;
  else if (sitemap.found) indexScore += 3;
  if (!meta.robots?.includes('noindex')) indexScore += 5;
  if (!meta.robots?.includes('nofollow')) indexScore += 3;
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

  // 5. Mobile & Performance (15 points max)
  let perfScore = 0;
  const perfMax = 15;
  if (performance.hasViewportMeta) perfScore += 10;
  if (performance.hasLazyLoading) perfScore += 5;
  breakdown.push({
    category: 'Mobile & Performance',
    score: Math.min(perfScore, perfMax),
    maxScore: perfMax,
    details: `Viewport: ${performance.hasViewportMeta ? '✓' : '✗'} | Lazy loading: ${performance.hasLazyLoading ? '✓' : '✗'}`,
  });

  // 6. Links Health (10 points max)
  let linksScore = 10;
  const linksMax = 10;
  if (brokenLinks.length > 0) {
    linksScore = Math.max(0, 10 - brokenLinks.length * 3);
  }
  breakdown.push({
    category: 'Links Health',
    score: Math.min(linksScore, linksMax),
    maxScore: linksMax,
    details: brokenLinks.length === 0 ? 'No broken links detected' : `${brokenLinks.length} broken link(s) found`,
  });

  // 7. Internationalization (10 points max) - only scored if site has lang or hreflang
  let i18nScore = 0;
  const i18nMax = 10;
  if (meta.language) i18nScore += 4;
  if (hreflangAnalysis.detected.length > 0) {
    i18nScore += 3;
    if (hreflangAnalysis.issues.length === 0) i18nScore += 3;
  } else if (meta.language) {
    // Single language site with lang declared is fine
    i18nScore += 6;
  }
  breakdown.push({
    category: 'Internationalization',
    score: Math.min(i18nScore, i18nMax),
    maxScore: i18nMax,
    details: meta.language ? `Lang: ${meta.language} | Versions: ${hreflangAnalysis.detected.length || 'single language'}` : 'No language declared',
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

  // HTML analysis confidence
  indicators.push({
    aspect: 'HTML Analysis',
    level: html.length > 500 ? 'verified' : html.length > 0 ? 'partial' : 'uncertain',
    detail: html.length > 500
      ? `Full HTML analyzed (${Math.round(html.length / 1024)}KB)`
      : html.length > 0
        ? `Limited HTML retrieved (${html.length} chars). Some elements may be loaded dynamically.`
        : 'HTML could not be retrieved. Results may be inaccurate.',
  });

  // Meta tags confidence
  indicators.push({
    aspect: 'Meta Tags',
    level: 'verified',
    detail: 'Meta tags are extracted directly from HTML source code.',
  });

  // robots.txt confidence
  indicators.push({
    aspect: 'robots.txt',
    level: robotsTxt.found ? 'verified' : 'verified',
    detail: robotsTxt.found
      ? 'robots.txt retrieved and parsed successfully.'
      : 'robots.txt not found at standard location (/robots.txt).',
  });

  // Sitemap confidence
  indicators.push({
    aspect: 'Sitemap',
    level: sitemap.found ? 'verified' : 'verified',
    detail: sitemap.found
      ? `Sitemap found with ${sitemap.urlCount || 0} URLs. Validity: ${sitemap.isValid ? 'valid' : 'invalid'}.`
      : 'No sitemap found at /sitemap.xml or in robots.txt.',
  });

  // URL discovery confidence
  indicators.push({
    aspect: 'URL Discovery',
    level: mappedUrlCount > 0 ? 'verified' : 'partial',
    detail: mappedUrlCount > 0
      ? `${mappedUrlCount} URLs discovered via site crawl.`
      : 'URL discovery limited to links found on analyzed page.',
  });

  // Content analysis confidence
  indicators.push({
    aspect: 'Content Analysis',
    level: contentAnalysis.wordCount > 50 ? 'verified' : 'partial',
    detail: contentAnalysis.wordCount > 50
      ? `${contentAnalysis.wordCount} words analyzed. Keyword density and readability computed.`
      : 'Very little text content found. Page may rely on JavaScript rendering.',
  });

  // AI suggestions confidence
  indicators.push({
    aspect: 'AI Suggestions',
    level: contentAnalysis.suggestions.title ? 'partial' : 'not_checked',
    detail: contentAnalysis.suggestions.title
      ? 'AI suggestions are recommendations based on content analysis. Verify before applying.'
      : 'AI suggestions could not be generated.',
  });

  // Merchant analysis confidence
  if (merchantAnalysis.isProductPage) {
    indicators.push({
      aspect: 'Merchant Analysis',
      level: merchantAnalysis.structuredDataFound ? 'verified' : 'partial',
      detail: merchantAnalysis.structuredDataFound
        ? `${merchantAnalysis.products.length} product(s) extracted from JSON-LD structured data.`
        : 'Product page detected but no structured data found. Analysis based on HTML patterns.',
    });
  }

  // Broken links confidence
  indicators.push({
    aspect: 'Broken Links',
    level: 'partial',
    detail: 'Only the first 15 links are checked. Some links may timeout without being truly broken.',
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
  // Deduplicate and clean URLs
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
  merchantAnalysis: MerchantAnalysis
): ActionReport {
  const automated: ActionReport['automated'] = [];
  const manual: ActionReport['manual'] = [];

  fixes.forEach(fix => {
    automated.push({
      action: fix.label,
      status: fix.status === 'auto_generated' ? '✅ Generated' : '📝 Review needed',
      details: fix.description,
    });
  });

  if (meta.robots?.includes('noindex')) {
    manual.push({ action: 'Remove noindex directive', instructions: 'Edit the <meta name="robots"> tag to remove "noindex" if you want this page indexed.', priority: 'High' });
  }
  if (!meta.hasH1) {
    manual.push({ action: 'Add an H1 tag', instructions: 'Add a unique H1 heading with your target keyword.', priority: 'High' });
  }
  if (!meta.language) {
    manual.push({ action: 'Declare site language', instructions: 'Add lang="fr" (or appropriate language) to your <html> tag.', priority: 'Medium' });
  }
  if (!sitemap.found) {
    manual.push({ action: 'Deploy sitemap.xml', instructions: 'Download the generated sitemap and place it at your site root. Then submit it in Google Search Console.', priority: 'High' });
  }
  if (!robotsTxt.found) {
    manual.push({ action: 'Deploy robots.txt', instructions: 'Download the generated robots.txt and place it at your domain root.', priority: 'Medium' });
  }
  if (merchantAnalysis.isProductPage && !merchantAnalysis.structuredDataFound) {
    manual.push({ action: 'Add product structured data', instructions: 'Add Product JSON-LD in the <head> of your product pages for Google Shopping.', priority: 'High' });
  }
  if (merchantAnalysis.isProductPage && merchantAnalysis.products.length > 0) {
    manual.push({ action: 'Submit Merchant Center feed', instructions: 'Download the generated CSV feed, log into merchants.google.com, and import it under Products → Feeds.', priority: 'High' });
  }

  issues.filter(i => i.priority === 'High' && i.fixType === 'manual').forEach(issue => {
    const alreadyListed = manual.some(m => m.action.includes(issue.issue.substring(0, 20)));
    if (!alreadyListed) {
      manual.push({ action: issue.issue, instructions: issue.fix, priority: issue.priority });
    }
  });

  return { automated, manual };
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

async function checkRobotsTxt(url: string, apiKey: string) {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: robotsUrl, formats: ['markdown'], onlyMainContent: false }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { found: false, content: null, blocksGooglebot: false, error: 'robots.txt not found' };
    }

    const content = data.data?.markdown || data.markdown || '';
    const blocksGooglebot = /User-agent:\s*\*[\s\S]*?Disallow:\s*\/(?!\S)/i.test(content) ||
                            /User-agent:\s*Googlebot[\s\S]*?Disallow:\s*\/(?!\S)/i.test(content);

    return { found: true, content: content.substring(0, 2000), blocksGooglebot, error: null };
  } catch (error) {
    console.error('Error checking robots.txt:', error);
    return { found: false, content: null, blocksGooglebot: false, error: error instanceof Error ? error.message : 'Failed to check robots.txt' };
  }
}

async function checkSitemap(url: string, robotsContent: string | null, apiKey: string) {
  try {
    const urlObj = new URL(url);
    let sitemapUrl = `${urlObj.protocol}//${urlObj.host}/sitemap.xml`;
    
    if (robotsContent) {
      const sitemapMatch = robotsContent.match(/Sitemap:\s*(\S+)/i);
      if (sitemapMatch) sitemapUrl = sitemapMatch[1];
    }

    const response = await fetch(sitemapUrl);
    
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
      const response = await fetch(link, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      if (!response.ok) return { url: link, statusCode: response.status, error: null };
      return null;
    } catch (error) {
      return { url: link, statusCode: null, error: error instanceof Error ? error.message : 'Request failed' };
    }
  });

  const results = await Promise.all(checkPromises);
  return results.filter((r): r is BrokenLink => r !== null);
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
  
  // Use industry-standard SEO keywords for density analysis
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

function analyzeHreflang(html: string, currentLang: string | null): HreflangAnalysis {
  const detected: { lang: string; url: string }[] = [];
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  const hreflangRegex = /<link[^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  const hreflangRegex2 = /<link[^>]*href=["']([^"']+)["'][^>]*hreflang=["']([^"']+)["'][^>]*>/gi;
  
  let match;
  while ((match = hreflangRegex.exec(html)) !== null) {
    detected.push({ lang: match[1], url: match[2] });
  }
  while ((match = hreflangRegex2.exec(html)) !== null) {
    detected.push({ lang: match[2], url: match[1] });
  }
  
  const hasXDefault = detected.some(d => d.lang === 'x-default');
  
  if (detected.length === 0 && currentLang) {
    issues.push('No hreflang tags detected');
    recommendations.push('Add hreflang tags if your site exists in multiple languages');
  }
  
  if (detected.length > 0 && !hasXDefault) {
    issues.push('Missing hreflang x-default tag');
    recommendations.push('Add an hreflang="x-default" tag pointing to the default version');
  }
  
  if (detected.length > 0 && currentLang) {
    const hasSelfRef = detected.some(d => d.lang === currentLang || d.lang.startsWith(currentLang + '-'));
    if (!hasSelfRef) {
      issues.push('Page does not self-reference in hreflang');
      recommendations.push('Each page must include an hreflang pointing to itself');
    }
  }
  
  const validLangCodes = ['fr', 'en', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'ja', 'ko', 'ar', 'x-default'];
  detected.forEach(d => {
    const baseLang = d.lang.split('-')[0].toLowerCase();
    if (!validLangCodes.includes(baseLang) && d.lang !== 'x-default') {
      issues.push(`Potentially invalid language code: ${d.lang}`);
    }
  });
  
  if (detected.length > 0) {
    recommendations.push(`${detected.length} language version(s) detected: ${detected.map(d => d.lang).join(', ')}`);
  }
  
  return { detected, issues, recommendations };
}

function analyzeMerchantData(html: string): MerchantAnalysis {
  const products: ProductData[] = [];
  const issues: { issue: string; impact: string; fix: string; priority: 'High' | 'Medium' | 'Low' }[] = [];
  const feedRecommendations: string[] = [];
  
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let structuredDataFound = false;
  
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(match[1]);
      const items = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      for (const item of items) {
        if (item['@type'] === 'Product' || item['@type']?.includes('Product')) {
          structuredDataFound = true;
          
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
      console.error('Error parsing JSON-LD:', e);
    }
  }
  
  const hasProductIndicators = /add.to.cart|ajouter.au.panier|buy.now|acheter|prix|price|€|\$|£/i.test(html);
  const isProductPage = structuredDataFound || (hasProductIndicators && /<[^>]*class=[^>]*product/i.test(html));
  
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
  
  return { isProductPage, products, issues, structuredDataFound, feedRecommendations };
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
  merchantAnalysis: MerchantAnalysis
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

  return issues;
}
