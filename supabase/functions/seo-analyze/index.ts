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

interface SEOAnalysisResult {
  url: string;
  score: number;
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

    const meta = extractMetaInfo(html, metadata);
    const robotsTxt = await checkRobotsTxt(formattedUrl, apiKey);
    const sitemap = await checkSitemap(formattedUrl, robotsTxt.content, apiKey);
    const performance = extractPerformanceInfo(html);
    const brokenLinks = await checkBrokenLinks(links.slice(0, 10));
    const gscInstructions = generateGSCInstructions(formattedUrl, sitemap, robotsTxt);
    const contentAnalysis = await analyzeContent(markdown, meta, formattedUrl);
    const hreflangAnalysis = analyzeHreflang(html, meta.language);
    const merchantAnalysis = analyzeMerchantData(html);
    
    const issues = generateIssues(meta, robotsTxt, sitemap, performance, formattedUrl, brokenLinks, contentAnalysis, hreflangAnalysis, merchantAnalysis);
    const score = calculateScore(issues);

    // Generate autonomous fixes
    const generatedFixes = generateAutonomousFixes(formattedUrl, meta, robotsTxt, sitemap, contentAnalysis, merchantAnalysis, links);
    
    // Build action report
    const actionReport = buildActionReport(issues, generatedFixes, meta, sitemap, robotsTxt, merchantAnalysis);

    const result: SEOAnalysisResult = {
      url: formattedUrl,
      score,
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

    console.log('Analysis complete. Score:', score, 'Fixes generated:', generatedFixes.length);

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

// ─── Autonomous Fix Generation ───────────────────────────────────────

function generateAutonomousFixes(
  url: string,
  meta: ReturnType<typeof extractMetaInfo>,
  robotsTxt: Awaited<ReturnType<typeof checkRobotsTxt>>,
  sitemap: Awaited<ReturnType<typeof checkSitemap>>,
  contentAnalysis: ContentAnalysis,
  merchantAnalysis: MerchantAnalysis,
  links: string[]
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

  // 2. Generate sitemap.xml
  const internalLinks = links
    .filter((l: string) => {
      try { return new URL(l).host === urlObj.host; } catch { return false; }
    })
    .slice(0, 50);

  fixes.push({
    type: 'sitemap_xml',
    label: 'sitemap.xml généré',
    description: sitemap.found
      ? `Sitemap existant avec ${sitemap.urlCount || 0} URLs. Voici une version enrichie.`
      : 'Sitemap XML généré à partir des liens découverts sur votre site.',
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
    '# robots.txt généré par SKAL IA',
    `# Site: ${domain}`,
    `# Date: ${new Date().toISOString().split('T')[0]}`,
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Bloquer les pages d\'administration et les ressources internes',
    'Disallow: /admin/',
    'Disallow: /wp-admin/',
    'Disallow: /cart/',
    'Disallow: /checkout/',
    'Disallow: /account/',
    'Disallow: /search',
    'Disallow: /*?sort=',
    'Disallow: /*?filter=',
    '',
    '# Autoriser les crawlers pour les CSS et JS',
    'Allow: /wp-content/uploads/',
    'Allow: /*.css$',
    'Allow: /*.js$',
    '',
    `Sitemap: ${domain}/sitemap.xml`,
  ];
  return lines.join('\n');
}

function generateSitemapXml(domain: string, links: string[]): string {
  const uniqueLinks = [...new Set([domain + '/', ...links])];
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  uniqueLinks.forEach((link, i) => {
    const priority = i === 0 ? '1.0' : link.split('/').length <= 4 ? '0.8' : '0.6';
    const changefreq = i === 0 ? 'daily' : 'weekly';
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

function generateMetaTagsHtml(
  title: string,
  description: string,
  url: string,
  meta: ReturnType<typeof extractMetaInfo>
): string {
  const lines = [
    '<!-- Balises meta SEO optimisées par SKAL IA -->',
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
    lines.unshift('<!-- Ajoutez lang="fr" à votre balise <html> -->');
  }

  return lines.join('\n');
}

function generateWebsiteJsonLd(url: string, name: string, description: string): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: name,
    url: url,
    description: description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  return `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
}

function generateMerchantFeedCsv(products: ProductData[], pageUrl: string): string {
  const headers = [
    'id', 'title', 'description', 'link', 'image_link', 'price',
    'availability', 'brand', 'gtin', 'mpn', 'condition', 'product_type',
  ];
  
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

  // Automated actions
  fixes.forEach(fix => {
    automated.push({
      action: fix.label,
      status: fix.status === 'auto_generated' ? '✅ Généré' : '📝 À vérifier',
      details: fix.description,
    });
  });

  // Manual actions
  if (meta.robots?.includes('noindex')) {
    manual.push({
      action: 'Retirer la directive noindex',
      instructions: 'Modifiez la balise <meta name="robots"> pour retirer "noindex" si vous souhaitez que cette page soit indexée.',
      priority: 'High',
    });
  }

  if (!meta.hasH1) {
    manual.push({
      action: 'Ajouter une balise H1',
      instructions: 'Ajoutez un titre H1 unique contenant votre mot-clé principal dans le contenu de la page.',
      priority: 'High',
    });
  }

  if (!meta.language) {
    manual.push({
      action: 'Déclarer la langue du site',
      instructions: 'Ajoutez l\'attribut lang="fr" (ou la langue appropriée) à la balise <html>.',
      priority: 'Medium',
    });
  }

  if (!sitemap.found) {
    manual.push({
      action: 'Déployer le sitemap.xml',
      instructions: 'Téléchargez le sitemap généré ci-dessus et placez-le à la racine de votre site. Puis soumettez-le dans Google Search Console.',
      priority: 'High',
    });
  }

  if (!robotsTxt.found) {
    manual.push({
      action: 'Déployer le robots.txt',
      instructions: 'Téléchargez le robots.txt généré et placez-le à la racine de votre domaine.',
      priority: 'Medium',
    });
  }

  if (merchantAnalysis.isProductPage && !merchantAnalysis.structuredDataFound) {
    manual.push({
      action: 'Ajouter les données structurées produit',
      instructions: 'Intégrez le JSON-LD Product dans le <head> de vos pages produit pour Google Shopping.',
      priority: 'High',
    });
  }

  if (merchantAnalysis.isProductPage && merchantAnalysis.products.length > 0) {
    manual.push({
      action: 'Soumettre le flux Merchant Center',
      instructions: 'Téléchargez le flux CSV généré, connectez-vous à merchants.google.com, et importez-le dans Produits > Flux.',
      priority: 'High',
    });
  }

  // Add remaining high-priority issues as manual actions
  issues.filter(i => i.priority === 'High' && i.fixType === 'manual').forEach(issue => {
    const alreadyListed = manual.some(m => m.action.includes(issue.issue.substring(0, 20)));
    if (!alreadyListed) {
      manual.push({
        action: issue.issue,
        instructions: issue.fix,
        priority: issue.priority,
      });
    }
  });

  return { automated, manual };
}

// ─── Original Analysis Functions ─────────────────────────────────────

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
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
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
    "1. Connectez-vous à Google Search Console (search.google.com/search-console)",
    `2. Ajoutez la propriété "${new URL(url).host}" si ce n'est pas déjà fait`,
    "3. Validez la propriété via DNS, balise HTML ou fichier HTML",
  ];

  if (sitemap.found && sitemap.url) {
    instructions.push(`4. Soumettez votre sitemap : Sitemaps → Ajouter un sitemap → "${sitemap.url}"`);
  } else {
    instructions.push("4. Créez d'abord un sitemap.xml, puis soumettez-le dans l'onglet Sitemaps");
  }

  instructions.push(
    "5. Utilisez l'outil d'inspection d'URL pour demander l'indexation des pages importantes",
    "6. Surveillez les rapports de couverture pour détecter les erreurs d'indexation"
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
    const prompt = `Analyse ce contenu web et génère des suggestions SEO en français.

URL: ${url}
Titre actuel: ${meta.title || 'Aucun'}
Description actuelle: ${meta.description || 'Aucune'}

Contenu (extrait):
${contentPreview}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "suggestedTitle": "Nouveau titre optimisé SEO (max 60 caractères)",
  "suggestedDescription": "Nouvelle meta description optimisée (max 155 caractères)",
  "improvements": ["amélioration 1", "amélioration 2", "amélioration 3"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
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
    issues.push('Aucune balise hreflang détectée');
    recommendations.push('Ajoutez des balises hreflang si votre site existe en plusieurs langues');
  }
  
  if (detected.length > 0 && !hasXDefault) {
    issues.push('Balise hreflang x-default manquante');
    recommendations.push('Ajoutez une balise hreflang="x-default" pointant vers la version par défaut');
  }
  
  if (detected.length > 0 && currentLang) {
    const hasSelfRef = detected.some(d => d.lang === currentLang || d.lang.startsWith(currentLang + '-'));
    if (!hasSelfRef) {
      issues.push('La page ne fait pas référence à elle-même dans les hreflang');
      recommendations.push('Chaque page doit inclure un hreflang pointant vers elle-même');
    }
  }
  
  const validLangCodes = ['fr', 'en', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'ja', 'ko', 'ar', 'x-default'];
  detected.forEach(d => {
    const baseLang = d.lang.split('-')[0].toLowerCase();
    if (!validLangCodes.includes(baseLang) && d.lang !== 'x-default') {
      issues.push(`Code langue potentiellement invalide: ${d.lang}`);
    }
  });
  
  if (detected.length > 0) {
    recommendations.push(`${detected.length} version(s) linguistique(s) détectée(s): ${detected.map(d => d.lang).join(', ')}`);
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
    issues.push({
      issue: 'Données structurées produit manquantes',
      impact: 'Google Merchant ne peut pas extraire les informations produit.',
      fix: 'Ajoutez des données structurées JSON-LD de type "Product".',
      priority: 'High',
    });
  }
  
  products.forEach((product, index) => {
    const prefix = products.length > 1 ? `Produit ${index + 1}: ` : '';
    
    if (!product.price) issues.push({ issue: `${prefix}Prix manquant`, impact: 'Requis pour Google Shopping.', fix: 'Ajoutez "offers.price".', priority: 'High' });
    if (!product.currency) issues.push({ issue: `${prefix}Devise manquante`, impact: 'Prix non interprétable.', fix: 'Ajoutez "offers.priceCurrency".', priority: 'High' });
    if (!product.availability) issues.push({ issue: `${prefix}Disponibilité manquante`, impact: 'Requis pour l\'affichage.', fix: 'Ajoutez "offers.availability".', priority: 'High' });
    if (!product.gtin && !product.mpn) issues.push({ issue: `${prefix}GTIN/MPN manquant`, impact: 'Identifiant requis.', fix: 'Ajoutez "gtin" ou "mpn".', priority: 'Medium' });
    if (!product.brand) issues.push({ issue: `${prefix}Marque manquante`, impact: 'Améliore la visibilité.', fix: 'Ajoutez "brand".', priority: 'Medium' });
    if (!product.image) issues.push({ issue: `${prefix}Image manquante`, impact: 'Requis pour Google Shopping.', fix: 'Ajoutez "image".', priority: 'High' });
    if (!product.description || product.description.length < 50) issues.push({ issue: `${prefix}Description courte`, impact: 'Améliore le référencement.', fix: 'Ajoutez min 150 caractères.', priority: 'Medium' });
    if (!product.shipping) issues.push({ issue: `${prefix}Livraison manquante`, impact: 'Info optionnelle mais recommandée.', fix: 'Configurez dans Merchant Center.', priority: 'Low' });
  });
  
  if (isProductPage) {
    feedRecommendations.push(
      '📋 Pour soumettre vos produits à Google Merchant Center :',
      '1. Créez un compte Merchant Center sur merchants.google.com',
      '2. Vérifiez et revendiquez votre site web',
      '3. Téléchargez le flux CSV généré par SKAL IA ci-dessous',
      '4. Importez-le dans Produits → Flux → Nouveau flux',
      '5. Corrigez les erreurs signalées par Merchant Center',
      '6. Activez les annonces Shopping gratuites'
    );
    
    if (products.length > 0) {
      feedRecommendations.push('', `✅ ${products.length} produit(s) détecté(s) et inclus dans le flux`);
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
    issues.push({ id: `issue-${issueId++}`, issue: 'Titre de page manquant', impact: 'Google utilise le titre comme lien dans les résultats.', fix: 'Ajoutez une balise <title> de moins de 60 caractères.', priority: 'High', category: 'Balises Meta', fixType: 'automated' });
  } else if (meta.title.length > 60) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Titre trop long', impact: `Tronqué dans les résultats (${meta.title.length} car.).`, fix: 'Raccourcissez à moins de 60 caractères.', priority: 'Medium', category: 'Balises Meta', fixType: 'automated' });
  }

  if (!meta.description) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Meta description manquante', impact: 'Google génère un extrait automatique.', fix: 'Ajoutez une meta description de 150-160 caractères.', priority: 'High', category: 'Balises Meta', fixType: 'automated' });
  } else if (meta.description.length > 160) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Meta description trop longue', impact: `Tronquée (${meta.description.length} car.).`, fix: 'Raccourcissez à moins de 160 caractères.', priority: 'Low', category: 'Balises Meta', fixType: 'automated' });
  }

  if (!meta.hasH1) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Balise H1 manquante', impact: 'Les moteurs ne comprennent pas le sujet principal.', fix: 'Ajoutez une balise H1 avec votre mot-clé cible.', priority: 'High', category: 'Structure', fixType: 'manual' });
  } else if (meta.h1Count > 1) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Plusieurs balises H1', impact: `${meta.h1Count} H1 trouvées, gardez-en une seule.`, fix: 'Utilisez H2-H6 pour les sous-titres.', priority: 'Medium', category: 'Structure', fixType: 'manual' });
  }

  if (!meta.language) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Langue non déclarée', impact: 'Mauvaise indexation linguistique.', fix: 'Ajoutez lang="fr" à <html>.', priority: 'Medium', category: 'Multilingue', fixType: 'manual' });
  }

  if (!robotsTxt.found) {
    issues.push({ id: `issue-${issueId++}`, issue: 'robots.txt manquant', impact: 'Les robots peuvent crawler inutilement.', fix: 'Déployez le robots.txt généré par SKAL IA.', priority: 'Medium', category: 'Exploration', fixType: 'automated' });
  } else if (robotsTxt.blocksGooglebot) {
    issues.push({ id: `issue-${issueId++}`, issue: 'robots.txt bloque les moteurs', impact: 'Vos pages ne seront pas indexées.', fix: 'Corrigez les directives Disallow.', priority: 'High', category: 'Exploration', fixType: 'semi-automated' });
  }

  if (!sitemap.found) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Sitemap XML manquant', impact: 'Pages potentiellement non indexées.', fix: 'Déployez le sitemap généré par SKAL IA.', priority: 'Medium', category: 'Exploration', fixType: 'automated' });
  } else if (!sitemap.isValid) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Sitemap invalide', impact: 'Google ne peut pas le lire.', fix: 'Vérifiez la structure XML.', priority: 'High', category: 'Exploration', fixType: 'semi-automated' });
  }

  if (!meta.canonical) {
    issues.push({ id: `issue-${issueId++}`, issue: 'URL canonique manquante', impact: 'Risque de contenu dupliqué.', fix: 'Ajoutez <link rel="canonical">.', priority: 'Low', category: 'SEO Technique', fixType: 'automated' });
  }

  if (!meta.hasOgTags) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Open Graph manquant', impact: 'Pas d\'aperçu enrichi sur les réseaux.', fix: 'Ajoutez og:title, og:description, og:image.', priority: 'Low', category: 'Réseaux sociaux', fixType: 'automated' });
  }

  if (!meta.hasTwitterCards) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Twitter Cards manquantes', impact: 'Pas d\'aperçu sur Twitter/X.', fix: 'Ajoutez twitter:card, twitter:title.', priority: 'Low', category: 'Réseaux sociaux', fixType: 'automated' });
  }

  if (!performance.hasViewportMeta) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Viewport manquant', impact: 'Mauvais affichage mobile.', fix: 'Ajoutez <meta name="viewport">.', priority: 'High', category: 'Mobile', fixType: 'manual' });
  }

  if (meta.robots && (meta.robots.includes('noindex') || meta.robots.includes('nofollow'))) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Page en noindex/nofollow', impact: 'Page non indexée par Google.', fix: 'Retirez la directive si l\'indexation est souhaitée.', priority: 'High', category: 'Indexabilité', fixType: 'manual' });
  }

  if (brokenLinks.length > 0) {
    issues.push({ id: `issue-${issueId++}`, issue: `${brokenLinks.length} lien(s) cassé(s)`, impact: 'Nuit à l\'UX et au SEO.', fix: `Corrigez: ${brokenLinks.slice(0, 3).map(l => l.url).join(', ')}`, priority: 'Medium', category: 'Liens', fixType: 'manual' });
  }

  if (contentAnalysis.wordCount < 300) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Contenu trop court', impact: `${contentAnalysis.wordCount} mots, visez 300+.`, fix: 'Enrichissez avec du contenu pertinent.', priority: 'Medium', category: 'Contenu', fixType: 'manual' });
  }

  if (contentAnalysis.readabilityScore < 50) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Lisibilité faible', impact: `Score: ${contentAnalysis.readabilityScore}/100.`, fix: 'Simplifiez les phrases.', priority: 'Low', category: 'Contenu', fixType: 'manual' });
  }

  if (contentAnalysis.duplicateContent.length > 0) {
    issues.push({ id: `issue-${issueId++}`, issue: 'Contenu dupliqué', impact: `${contentAnalysis.duplicateContent.length} section(s) répétée(s).`, fix: 'Variez votre contenu.', priority: 'Medium', category: 'Contenu', fixType: 'manual' });
  }

  hreflangAnalysis.issues.forEach(issue => {
    issues.push({ id: `issue-${issueId++}`, issue, impact: 'Mauvaise version linguistique servie.', fix: hreflangAnalysis.recommendations[0] || 'Vérifiez hreflang.', priority: 'Medium', category: 'Multilingue', fixType: 'manual' });
  });

  if (merchantAnalysis.isProductPage) {
    merchantAnalysis.issues.forEach(mi => {
      issues.push({ id: `issue-${issueId++}`, issue: mi.issue, impact: mi.impact, fix: mi.fix, priority: mi.priority, category: 'Google Merchant', fixType: 'manual' });
    });
  }

  return issues;
}

function calculateScore(issues: SEOIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    switch (issue.priority) {
      case 'High': score -= 15; break;
      case 'Medium': score -= 8; break;
      case 'Low': score -= 3; break;
    }
  }
  return Math.max(0, Math.min(100, score));
}
