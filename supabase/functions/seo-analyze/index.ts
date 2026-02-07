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

    // Extract SEO elements from HTML
    const meta = extractMetaInfo(html, metadata);
    
    // Check robots.txt
    const robotsTxt = await checkRobotsTxt(formattedUrl, apiKey);
    
    // Check sitemap
    const sitemap = await checkSitemap(formattedUrl, robotsTxt.content);
    
    // Check performance indicators
    const performance = extractPerformanceInfo(html);
    
    // Analyze and generate issues
    const issues = generateIssues(meta, robotsTxt, sitemap, performance, formattedUrl);
    
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

async function checkSitemap(url: string, robotsContent: string | null) {
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

    const response = await fetch(sitemapUrl, { method: 'HEAD' });
    
    if (response.ok) {
      return {
        found: true,
        url: sitemapUrl,
        error: null,
      };
    }
    
    return {
      found: false,
      url: null,
      error: 'Sitemap not found at standard location',
    };
  } catch (error) {
    console.error('Error checking sitemap:', error);
    return {
      found: false,
      url: null,
      error: error instanceof Error ? error.message : 'Failed to check sitemap',
    };
  }
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
  url: string
): SEOIssue[] {
  const issues: SEOIssue[] = [];
  let issueId = 1;

  // Critical: Title issues
  if (!meta.title) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Missing page title',
      impact: 'Google uses the title as the main clickable link in search results. Without it, your page may not appear or will show an auto-generated title.',
      fix: 'Add a <title> tag in the <head> section with a descriptive title under 60 characters.',
      priority: 'High',
      category: 'Meta Tags',
    });
  } else if (meta.title.length > 60) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Title too long',
      impact: 'Titles over 60 characters get cut off in search results, potentially hiding important information.',
      fix: `Shorten your title to under 60 characters. Current length: ${meta.title.length} characters.`,
      priority: 'Medium',
      category: 'Meta Tags',
    });
  }

  // Critical: Description issues
  if (!meta.description) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Missing meta description',
      impact: 'The meta description appears under your title in search results. Without it, Google will auto-generate a snippet that may not represent your page well.',
      fix: 'Add a <meta name="description" content="..."> tag with a compelling description of 150-160 characters.',
      priority: 'High',
      category: 'Meta Tags',
    });
  } else if (meta.description.length > 160) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Meta description too long',
      impact: 'Descriptions over 160 characters get truncated in search results.',
      fix: `Shorten your meta description to under 160 characters. Current length: ${meta.description.length} characters.`,
      priority: 'Low',
      category: 'Meta Tags',
    });
  }

  // H1 issues
  if (!meta.hasH1) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Missing H1 heading',
      impact: 'The H1 tag tells Google what your page is about. Without it, search engines may not understand your main topic.',
      fix: 'Add exactly one <h1> tag with your main page heading that includes your primary keyword.',
      priority: 'High',
      category: 'Content Structure',
    });
  } else if (meta.h1Count > 1) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Multiple H1 headings',
      impact: 'Having multiple H1 tags can confuse search engines about your page\'s main topic.',
      fix: `Reduce to a single H1 tag. Currently found: ${meta.h1Count} H1 tags. Use H2-H6 for subheadings.`,
      priority: 'Medium',
      category: 'Content Structure',
    });
  }

  // Language issues
  if (!meta.language) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Missing language declaration',
      impact: 'Without a language attribute, Google may not properly index your content for language-specific searches.',
      fix: 'Add lang="fr" (or your language code) to the <html> tag.',
      priority: 'Medium',
      category: 'Multilingual',
    });
  }

  // Robots.txt issues
  if (!robotsTxt.found) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Missing robots.txt file',
      impact: 'The robots.txt file tells search engines which pages to crawl. Without it, crawlers may waste resources on unimportant pages.',
      fix: 'Create a robots.txt file at the root of your domain. At minimum, include: User-agent: *\nAllow: /',
      priority: 'Medium',
      category: 'Crawlability',
    });
  } else if (robotsTxt.blocksGooglebot) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'robots.txt blocks search engines',
      impact: 'Your robots.txt is blocking Googlebot from accessing your site. This prevents your pages from appearing in search results.',
      fix: 'Review your robots.txt file and ensure you\'re not blocking important pages with "Disallow: /".',
      priority: 'High',
      category: 'Crawlability',
    });
  }

  // Sitemap issues
  if (!sitemap.found) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Missing XML sitemap',
      impact: 'A sitemap helps Google discover all your pages. Without it, some pages may not be indexed.',
      fix: 'Create a sitemap.xml file listing all important pages and submit it to Google Search Console.',
      priority: 'Medium',
      category: 'Crawlability',
    });
  }

  // Canonical issues
  if (!meta.canonical) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Missing canonical URL',
      impact: 'Without a canonical tag, duplicate content issues may occur if your page is accessible via multiple URLs.',
      fix: 'Add a <link rel="canonical" href="..."> tag pointing to the preferred URL of this page.',
      priority: 'Low',
      category: 'Technical SEO',
    });
  }

  // Social tags issues
  if (!meta.hasOgTags) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Missing Open Graph tags',
      impact: 'When shared on social media (Facebook, LinkedIn), your page won\'t have a rich preview with image and description.',
      fix: 'Add Open Graph meta tags: og:title, og:description, og:image, and og:url.',
      priority: 'Low',
      category: 'Social Media',
    });
  }

  if (!meta.hasTwitterCards) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Missing Twitter Card tags',
      impact: 'When shared on Twitter/X, your page won\'t display with an optimized preview.',
      fix: 'Add Twitter Card meta tags: twitter:card, twitter:title, twitter:description, twitter:image.',
      priority: 'Low',
      category: 'Social Media',
    });
  }

  // Performance issues
  if (!performance.hasViewportMeta) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Missing viewport meta tag',
      impact: 'Your site may not display correctly on mobile devices, hurting your mobile rankings.',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the <head> section.',
      priority: 'High',
      category: 'Mobile',
    });
  }

  // Robots meta issues
  if (meta.robots && (meta.robots.includes('noindex') || meta.robots.includes('nofollow'))) {
    issues.push({
      id: `issue-${issueId++}`,
      issue: 'Page set to noindex or nofollow',
      impact: 'This page is explicitly telling Google not to index it or follow its links. It will not appear in search results.',
      fix: 'If you want this page indexed, remove or modify the robots meta tag to allow indexing.',
      priority: 'High',
      category: 'Indexability',
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
