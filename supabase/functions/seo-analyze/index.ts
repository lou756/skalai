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

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Analyzing URL:', formattedUrl);

    // Step 1: Scrape the main page
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

    // Extract SEO elements from HTML
    const meta = extractMetaInfo(html, metadata);
    
    // Check robots.txt
    const robotsTxt = await checkRobotsTxt(formattedUrl, apiKey);
    
    // Check sitemap with validation
    const sitemap = await checkSitemap(formattedUrl, robotsTxt.content, apiKey);
    
    // Check performance indicators
    const performance = extractPerformanceInfo(html);
    
    // Check for broken links (limit to 10 for performance)
    const brokenLinks = await checkBrokenLinks(links.slice(0, 10));
    
    // Generate GSC instructions
    const gscInstructions = generateGSCInstructions(formattedUrl, sitemap, robotsTxt);
    
    // Analyze content
    const contentAnalysis = await analyzeContent(markdown, meta, formattedUrl);
    
    // Analyze hreflang
    const hreflangAnalysis = analyzeHreflang(html, meta.language);
    
    // Analyze for Google Merchant Center
    const merchantAnalysis = analyzeMerchantData(html);
    
    // Analyze and generate issues (include content and merchant issues)
    const issues = generateIssues(meta, robotsTxt, sitemap, performance, formattedUrl, brokenLinks, contentAnalysis, hreflangAnalysis, merchantAnalysis);
    
    // Calculate score
    const score = calculateScore(issues);

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
    };

    console.log('Analysis complete. Score:', score);

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

function extractMetaInfo(html: string, metadata: Record<string, unknown>) {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : (metadata.title as string) || null;

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : (metadata.description as string) || null;

  // Extract canonical
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
                         html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : null;

  // Extract robots meta
  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i);
  const robots = robotsMatch ? robotsMatch[1].trim() : null;

  // Extract language
  const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  const language = langMatch ? langMatch[1].trim() : (metadata.language as string) || null;

  // Extract hreflang tags
  const hreflangMatches = html.matchAll(/<link[^>]*hreflang=["']([^"']+)["'][^>]*>/gi);
  const hreflang = Array.from(hreflangMatches).map(m => m[1]);

  // Check H1 tags
  const h1Matches = html.match(/<h1[^>]*>/gi) || [];
  const hasH1 = h1Matches.length > 0;
  const h1Count = h1Matches.length;

  // Check Open Graph tags
  const hasOgTags = /<meta[^>]*property=["']og:/i.test(html);

  // Check Twitter Cards
  const hasTwitterCards = /<meta[^>]*name=["']twitter:/i.test(html);

  return {
    title,
    description,
    canonical,
    robots,
    language,
    hreflang,
    hasH1,
    h1Count,
    hasOgTags,
    hasTwitterCards,
  };
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
      body: JSON.stringify({
        url: robotsUrl,
        formats: ['markdown'],
        onlyMainContent: false,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return {
        found: false,
        content: null,
        blocksGooglebot: false,
        error: 'robots.txt not found',
      };
    }

    const content = data.data?.markdown || data.markdown || '';
    const blocksGooglebot = /User-agent:\s*\*[\s\S]*?Disallow:\s*\/(?!\S)/i.test(content) ||
                            /User-agent:\s*Googlebot[\s\S]*?Disallow:\s*\/(?!\S)/i.test(content);

    return {
      found: true,
      content: content.substring(0, 2000),
      blocksGooglebot,
      error: null,
    };
  } catch (error) {
    console.error('Error checking robots.txt:', error);
    return {
      found: false,
      content: null,
      blocksGooglebot: false,
      error: error instanceof Error ? error.message : 'Failed to check robots.txt',
    };
  }
}

async function checkSitemap(url: string, robotsContent: string | null, apiKey: string) {
  try {
    const urlObj = new URL(url);
    
    // Try to find sitemap URL in robots.txt
    let sitemapUrl = `${urlObj.protocol}//${urlObj.host}/sitemap.xml`;
    
    if (robotsContent) {
      const sitemapMatch = robotsContent.match(/Sitemap:\s*(\S+)/i);
      if (sitemapMatch) {
        sitemapUrl = sitemapMatch[1];
      }
    }

    const response = await fetch(sitemapUrl);
    
    if (!response.ok) {
      return {
        found: false,
        url: null,
        error: 'Sitemap not found at standard location',
        isValid: false,
        urlCount: null,
      };
    }

    const sitemapContent = await response.text();
    
    // Validate sitemap structure
    const isValid = sitemapContent.includes('<?xml') && 
                    (sitemapContent.includes('<urlset') || sitemapContent.includes('<sitemapindex'));
    
    // Count URLs in sitemap
    const urlMatches = sitemapContent.match(/<loc>/gi);
    const urlCount = urlMatches ? urlMatches.length : 0;

    return {
      found: true,
      url: sitemapUrl,
      error: null,
      isValid,
      urlCount,
    };
  } catch (error) {
    console.error('Error checking sitemap:', error);
    return {
      found: false,
      url: null,
      error: error instanceof Error ? error.message : 'Failed to check sitemap',
      isValid: false,
      urlCount: null,
    };
  }
}

async function checkBrokenLinks(links: string[]): Promise<{ url: string; statusCode: number | null; error: string | null }[]> {
  const brokenLinks: { url: string; statusCode: number | null; error: string | null }[] = [];
  
  const checkPromises = links.map(async (link) => {
    try {
      // Skip non-http links
      if (!link.startsWith('http')) return null;
      
      const response = await fetch(link, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) {
        return {
          url: link,
          statusCode: response.status,
          error: null,
        };
      }
      return null;
    } catch (error) {
      return {
        url: link,
        statusCode: null,
        error: error instanceof Error ? error.message : 'Request failed',
      };
    }
  });

  const results = await Promise.all(checkPromises);
  return results.filter((r): r is { url: string; statusCode: number | null; error: string | null } => r !== null);
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
  // Word count
  const words = markdown.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Calculate readability (simplified Flesch-like score)
  const sentences = markdown.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
  const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 3));
  
  // Keyword density (top 10 words, excluding common words)
  const stopWords = new Set(['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en', 'à', 'pour', 'que', 'qui', 'dans', 'sur', 'par', 'avec', 'ce', 'cette', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'it', 'its', 'this', 'that', 'these', 'those']);
  
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    const cleaned = word.toLowerCase().replace(/[^a-zàâäéèêëïîôùûüç]/g, '');
    if (cleaned.length > 3 && !stopWords.has(cleaned)) {
      wordFrequency[cleaned] = (wordFrequency[cleaned] || 0) + 1;
    }
  });
  
  const keywordDensity = Object.entries(wordFrequency)
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: Math.round((count / wordCount) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Detect duplicate content (repeated paragraphs)
  const paragraphs = markdown.split(/\n\n+/).filter(p => p.trim().length > 50);
  const paragraphCounts: Record<string, number> = {};
  paragraphs.forEach(p => {
    const normalized = p.trim().toLowerCase().substring(0, 100);
    paragraphCounts[normalized] = (paragraphCounts[normalized] || 0) + 1;
  });
  
  const duplicateContent = Object.entries(paragraphCounts)
    .filter(([_, count]) => count > 1)
    .map(([text, count]) => ({ text: text.substring(0, 50) + '...', count }));
  
  // Generate suggestions using AI
  const suggestions = await generateSEOSuggestions(meta, markdown, url);
  
  return {
    wordCount,
    readabilityScore: Math.round(readabilityScore),
    keywordDensity,
    duplicateContent,
    suggestions,
  };
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
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('AI Gateway error:', response.status);
      return { title: null, description: null, improvements: [] };
    }

    const aiData = await response.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
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
  
  // Extract hreflang tags
  const hreflangRegex = /<link[^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  const hreflangRegex2 = /<link[^>]*href=["']([^"']+)["'][^>]*hreflang=["']([^"']+)["'][^>]*>/gi;
  
  let match;
  while ((match = hreflangRegex.exec(html)) !== null) {
    detected.push({ lang: match[1], url: match[2] });
  }
  while ((match = hreflangRegex2.exec(html)) !== null) {
    detected.push({ lang: match[2], url: match[1] });
  }
  
  // Check for x-default
  const hasXDefault = detected.some(d => d.lang === 'x-default');
  
  // Generate issues and recommendations
  if (detected.length === 0 && currentLang) {
    issues.push('Aucune balise hreflang détectée');
    recommendations.push('Ajoutez des balises hreflang si votre site existe en plusieurs langues');
  }
  
  if (detected.length > 0 && !hasXDefault) {
    issues.push('Balise hreflang x-default manquante');
    recommendations.push('Ajoutez une balise hreflang="x-default" pointant vers la version par défaut');
  }
  
  // Check for self-referencing
  if (detected.length > 0 && currentLang) {
    const hasSelfRef = detected.some(d => d.lang === currentLang || d.lang.startsWith(currentLang + '-'));
    if (!hasSelfRef) {
      issues.push('La page ne fait pas référence à elle-même dans les hreflang');
      recommendations.push('Chaque page doit inclure un hreflang pointant vers elle-même');
    }
  }
  
  // Check for common language codes
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
  
  // Extract JSON-LD structured data
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
          
          const product: ProductData = {
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
          };
          
          products.push(product);
        }
      }
    } catch (e) {
      console.error('Error parsing JSON-LD:', e);
    }
  }
  
  // Check for product indicators without structured data
  const hasProductIndicators = /add.to.cart|ajouter.au.panier|buy.now|acheter|prix|price|€|\$|£/i.test(html);
  const isProductPage = structuredDataFound || (hasProductIndicators && /<[^>]*class=[^>]*product/i.test(html));
  
  // Generate Merchant Center issues
  if (isProductPage && !structuredDataFound) {
    issues.push({
      issue: 'Données structurées produit manquantes',
      impact: 'Google Merchant ne peut pas extraire automatiquement les informations produit. Votre produit risque de ne pas apparaître dans Google Shopping.',
      fix: 'Ajoutez des données structurées JSON-LD de type "Product" avec @context, @type, name, offers, etc.',
      priority: 'High',
    });
  }
  
  // Validate each product
  products.forEach((product, index) => {
    const prefix = products.length > 1 ? `Produit ${index + 1}: ` : '';
    
    if (!product.price) {
      issues.push({
        issue: `${prefix}Prix manquant`,
        impact: 'Google Merchant requiert un prix pour tous les produits. Sans prix, le produit sera rejeté.',
        fix: 'Ajoutez "offers.price" dans les données structurées avec le prix numérique.',
        priority: 'High',
      });
    }
    
    if (!product.currency) {
      issues.push({
        issue: `${prefix}Devise non spécifiée`,
        impact: 'Sans devise (EUR, USD...), Google ne peut pas afficher correctement le prix.',
        fix: 'Ajoutez "offers.priceCurrency" (ex: "EUR") dans les données structurées.',
        priority: 'High',
      });
    }
    
    if (!product.availability) {
      issues.push({
        issue: `${prefix}Disponibilité non indiquée`,
        impact: 'Google Merchant a besoin de savoir si le produit est en stock pour l\'afficher.',
        fix: 'Ajoutez "offers.availability" avec une valeur comme "https://schema.org/InStock".',
        priority: 'High',
      });
    }
    
    if (!product.gtin && !product.mpn) {
      issues.push({
        issue: `${prefix}GTIN ou MPN manquant`,
        impact: 'Les identifiants produit (GTIN/EAN/UPC ou MPN) sont requis pour la plupart des produits sur Merchant Center.',
        fix: 'Ajoutez "gtin" (code-barres EAN/UPC) ou "mpn" (référence fabricant) dans les données structurées.',
        priority: 'Medium',
      });
    }
    
    if (!product.brand) {
      issues.push({
        issue: `${prefix}Marque non spécifiée`,
        impact: 'La marque aide Google à identifier correctement le produit et améliore sa visibilité.',
        fix: 'Ajoutez "brand" avec le nom de la marque dans les données structurées.',
        priority: 'Medium',
      });
    }
    
    if (!product.image) {
      issues.push({
        issue: `${prefix}Image produit manquante`,
        impact: 'Les produits sans image ne peuvent pas apparaître dans Google Shopping.',
        fix: 'Ajoutez "image" avec l\'URL de l\'image principale du produit (min 100x100px, fond blanc recommandé).',
        priority: 'High',
      });
    }
    
    if (!product.description || product.description.length < 50) {
      issues.push({
        issue: `${prefix}Description trop courte ou manquante`,
        impact: 'Une description détaillée améliore le référencement et les conversions.',
        fix: 'Ajoutez "description" avec au moins 150 caractères décrivant le produit.',
        priority: 'Medium',
      });
    }
    
    if (!product.shipping) {
      issues.push({
        issue: `${prefix}Informations de livraison manquantes`,
        impact: 'Les frais de livraison doivent être configurés dans Merchant Center ou via les données structurées.',
        fix: 'Ajoutez "offers.shippingDetails" ou configurez la livraison dans Google Merchant Center.',
        priority: 'Low',
      });
    }
  });
  
  // Generate feed recommendations
  if (isProductPage) {
    feedRecommendations.push(
      '📋 Pour soumettre vos produits à Google Merchant Center :',
      '1. Créez un compte Merchant Center sur merchants.google.com',
      '2. Vérifiez et revendiquez votre site web',
      '3. Générez un flux produit (XML, CSV ou Google Sheets)',
      '4. Champs obligatoires du flux : id, title, description, link, image_link, price, availability',
      '5. Champs recommandés : gtin, mpn, brand, condition, shipping',
      '6. Soumettez le flux et corrigez les erreurs signalées'
    );
    
    if (products.length > 0) {
      feedRecommendations.push(
        '',
        '✅ Données produit détectées sur cette page - vérifiez qu\'elles correspondent à votre flux Merchant'
      );
    }
  }
  
  return {
    isProductPage,
    products,
    issues,
    structuredDataFound,
    feedRecommendations,
  };
}

function extractPerformanceInfo(html: string) {
  const hasLazyLoading = /loading=["']lazy["']/i.test(html);
  const hasViewportMeta = /<meta[^>]*name=["']viewport["']/i.test(html);

  return {
    hasLazyLoading,
    hasViewportMeta,
  };
}

function generateIssues(
  meta: ReturnType<typeof extractMetaInfo>,
  robotsTxt: Awaited<ReturnType<typeof checkRobotsTxt>>,
  sitemap: Awaited<ReturnType<typeof checkSitemap>>,
  performance: ReturnType<typeof extractPerformanceInfo>,
  url: string,
  brokenLinks: { url: string; statusCode: number | null; error: string | null }[],
  contentAnalysis: ContentAnalysis,
  hreflangAnalysis: HreflangAnalysis,
  merchantAnalysis: MerchantAnalysis
): SEOIssue[] {
  const issues: SEOIssue[] = [];
  let issueId = 1;

  // Critical: Title issues
  if (!meta.title) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Titre de page manquant',
      impact: 'Google utilise le titre comme lien principal dans les résultats. Sans titre, votre page risque de ne pas apparaître ou d\'afficher un titre auto-généré.',
      fix: 'Ajoutez une balise <title> dans la section <head> avec un titre descriptif de moins de 60 caractères.',
      priority: 'High',
      category: 'Balises Meta',
      fixType: 'manual',
    });
  } else if (meta.title.length > 60) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Titre trop long',
      impact: 'Les titres de plus de 60 caractères sont tronqués dans les résultats de recherche.',
      fix: `Raccourcissez votre titre à moins de 60 caractères. Longueur actuelle : ${meta.title.length} caractères.`,
      priority: 'Medium',
      category: 'Balises Meta',
      fixType: 'manual',
    });
  }

  // Critical: Description issues
  if (!meta.description) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Meta description manquante',
      impact: 'La meta description apparaît sous votre titre dans Google. Sans elle, Google génère un extrait qui peut mal représenter votre page.',
      fix: 'Ajoutez une balise <meta name="description" content="..."> avec une description attrayante de 150-160 caractères.',
      priority: 'High',
      category: 'Balises Meta',
      fixType: 'manual',
    });
  } else if (meta.description.length > 160) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Meta description trop longue',
      impact: 'Les descriptions de plus de 160 caractères sont tronquées dans les résultats.',
      fix: `Raccourcissez votre meta description à moins de 160 caractères. Longueur actuelle : ${meta.description.length} caractères.`,
      priority: 'Low',
      category: 'Balises Meta',
      fixType: 'manual',
    });
  }

  // H1 issues
  if (!meta.hasH1) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Balise H1 manquante',
      impact: 'La balise H1 indique à Google le sujet principal de votre page. Sans elle, les moteurs peuvent mal comprendre votre contenu.',
      fix: 'Ajoutez exactement une balise <h1> contenant votre titre principal avec votre mot-clé cible.',
      priority: 'High',
      category: 'Structure du contenu',
      fixType: 'manual',
    });
  } else if (meta.h1Count > 1) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Plusieurs balises H1',
      impact: 'Avoir plusieurs H1 peut confondre les moteurs sur le sujet principal de votre page.',
      fix: `Gardez une seule balise H1. Actuellement trouvées : ${meta.h1Count}. Utilisez H2-H6 pour les sous-titres.`,
      priority: 'Medium',
      category: 'Structure du contenu',
      fixType: 'manual',
    });
  }

  // Language issues
  if (!meta.language) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Langue non déclarée',
      impact: 'Sans attribut de langue, Google peut mal indexer votre contenu pour les recherches spécifiques à une langue.',
      fix: 'Ajoutez lang="fr" (ou votre code langue) à la balise <html>.',
      priority: 'Medium',
      category: 'Multilingue',
      fixType: 'manual',
    });
  }

  // Robots.txt issues
  if (!robotsTxt.found) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Fichier robots.txt manquant',
      impact: 'Le robots.txt indique aux moteurs quelles pages explorer. Sans lui, les robots peuvent gaspiller des ressources sur des pages non importantes.',
      fix: 'Créez un fichier robots.txt à la racine de votre domaine avec : User-agent: *\\nAllow: /',
      priority: 'Medium',
      category: 'Exploration',
      fixType: 'semi-automated',
    });
  } else if (robotsTxt.blocksGooglebot) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'robots.txt bloque les moteurs',
      impact: 'Votre robots.txt empêche Googlebot d\'accéder à votre site. Vos pages n\'apparaîtront pas dans les résultats.',
      fix: 'Vérifiez votre robots.txt et assurez-vous de ne pas bloquer les pages importantes avec "Disallow: /".',
      priority: 'High',
      category: 'Exploration',
      fixType: 'manual',
    });
  }

  // Sitemap issues
  if (!sitemap.found) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Sitemap XML manquant',
      impact: 'Un sitemap aide Google à découvrir toutes vos pages. Sans lui, certaines pages peuvent ne pas être indexées.',
      fix: 'Créez un fichier sitemap.xml listant toutes vos pages importantes et soumettez-le à Google Search Console.',
      priority: 'Medium',
      category: 'Exploration',
      fixType: 'automated',
    });
  } else if (!sitemap.isValid) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Structure du sitemap invalide',
      impact: 'Votre sitemap existe mais n\'a pas une structure XML valide. Google peut ne pas le lire correctement.',
      fix: 'Vérifiez que votre sitemap commence par <?xml et contient les balises <urlset> ou <sitemapindex> correctes.',
      priority: 'High',
      category: 'Exploration',
      fixType: 'semi-automated',
    });
  }

  // Canonical issues
  if (!meta.canonical) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'URL canonique manquante',
      impact: 'Sans balise canonical, des problèmes de contenu dupliqué peuvent survenir si votre page est accessible via plusieurs URLs.',
      fix: 'Ajoutez une balise <link rel="canonical" href="..."> pointant vers l\'URL préférée de cette page.',
      priority: 'Low',
      category: 'SEO Technique',
      fixType: 'manual',
    });
  }

  // Social tags issues
  if (!meta.hasOgTags) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Balises Open Graph manquantes',
      impact: 'Lors du partage sur Facebook/LinkedIn, votre page n\'aura pas d\'aperçu enrichi avec image et description.',
      fix: 'Ajoutez les balises Open Graph : og:title, og:description, og:image et og:url.',
      priority: 'Low',
      category: 'Réseaux sociaux',
      fixType: 'manual',
    });
  }

  if (!meta.hasTwitterCards) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Twitter Cards manquantes',
      impact: 'Lors du partage sur Twitter/X, votre page n\'affichera pas d\'aperçu optimisé.',
      fix: 'Ajoutez les balises Twitter Card : twitter:card, twitter:title, twitter:description, twitter:image.',
      priority: 'Low',
      category: 'Réseaux sociaux',
      fixType: 'manual',
    });
  }

  // Performance issues
  if (!performance.hasViewportMeta) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Balise viewport manquante',
      impact: 'Votre site peut ne pas s\'afficher correctement sur mobile, nuisant à votre référencement mobile.',
      fix: 'Ajoutez <meta name="viewport" content="width=device-width, initial-scale=1"> dans la section <head>.',
      priority: 'High',
      category: 'Mobile',
      fixType: 'manual',
    });
  }

  // Robots meta issues
  if (meta.robots && (meta.robots.includes('noindex') || meta.robots.includes('nofollow'))) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Page en noindex ou nofollow',
      impact: 'Cette page indique explicitement à Google de ne pas l\'indexer. Elle n\'apparaîtra pas dans les résultats.',
      fix: 'Si vous voulez indexer cette page, supprimez ou modifiez la balise robots meta.',
      priority: 'High',
      category: 'Indexabilité',
      fixType: 'manual',
    });
  }

  // Broken links issues
  if (brokenLinks.length > 0) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: `${brokenLinks.length} lien(s) cassé(s) détecté(s)`,
      impact: 'Les liens cassés nuisent à l\'expérience utilisateur et peuvent affecter négativement votre référencement.',
      fix: `Corrigez ou supprimez les liens suivants : ${brokenLinks.slice(0, 3).map(l => l.url).join(', ')}${brokenLinks.length > 3 ? '...' : ''}`,
      priority: 'Medium',
      category: 'Liens',
      fixType: 'manual',
    });
  }

  // Content analysis issues
  if (contentAnalysis.wordCount < 300) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Contenu trop court',
      impact: 'Les pages avec moins de 300 mots sont souvent considérées comme manquant de profondeur par Google.',
      fix: `Enrichissez votre contenu avec plus d'informations pertinentes. Actuellement : ${contentAnalysis.wordCount} mots.`,
      priority: 'Medium',
      category: 'Contenu',
      fixType: 'manual',
    });
  }

  if (contentAnalysis.readabilityScore < 50) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Lisibilité à améliorer',
      impact: 'Un contenu difficile à lire peut augmenter le taux de rebond et réduire l\'engagement.',
      fix: 'Simplifiez vos phrases et utilisez des paragraphes plus courts. Score actuel : ' + contentAnalysis.readabilityScore + '/100.',
      priority: 'Low',
      category: 'Contenu',
      fixType: 'manual',
    });
  }

  if (contentAnalysis.duplicateContent.length > 0) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Contenu dupliqué détecté',
      impact: 'Le contenu répétitif peut être pénalisé par Google et nuit à l\'expérience utilisateur.',
      fix: `${contentAnalysis.duplicateContent.length} section(s) répétée(s) trouvée(s). Variez votre contenu.`,
      priority: 'Medium',
      category: 'Contenu',
      fixType: 'manual',
    });
  }

  // Hreflang issues
  hreflangAnalysis.issues.forEach(issue => {
    issues.push({
      id: `issue-${issueId++}`,
      issue: issue,
      impact: 'Les problèmes hreflang peuvent empêcher Google de servir la bonne version linguistique à vos visiteurs.',
      fix: hreflangAnalysis.recommendations[0] || 'Vérifiez votre configuration hreflang.',
      priority: 'Medium',
      category: 'Multilingue',
      fixType: 'manual',
    });
  });

  // Merchant Center issues
  if (merchantAnalysis.isProductPage) {
    merchantAnalysis.issues.forEach(merchantIssue => {
      issues.push({
        id: `issue-${issueId++}`,
        issue: merchantIssue.issue,
        impact: merchantIssue.impact,
        fix: merchantIssue.fix,
        priority: merchantIssue.priority,
        category: 'Google Merchant',
        fixType: 'manual',
      });
    });
  }

  return issues;
}

function calculateScore(issues: SEOIssue[]): number {
  let score = 100;
  
  for (const issue of issues) {
    switch (issue.priority) {
      case 'High':
        score -= 15;
        break;
      case 'Medium':
        score -= 8;
        break;
      case 'Low':
        score -= 3;
        break;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}
