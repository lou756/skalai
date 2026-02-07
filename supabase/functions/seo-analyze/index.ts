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
    
    // Analyze and generate issues
    const issues = generateIssues(meta, robotsTxt, sitemap, performance, formattedUrl, brokenLinks);
    
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
  brokenLinks: { url: string; statusCode: number | null; error: string | null }[]
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
