import * as cheerio from 'cheerio';

export interface OGMetadata {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string | null;
  domain: string | null;
  favicon: string | null;
  type: string | null;
  siteName: string | null;
  locale: string | null;
  articlePublishedTime: string | null;
  articleModifiedTime: string | null;
  articleAuthor: string | null;
  twitterCard: string | null;
  twitterSite: string | null;
  twitterCreator: string | null;
  themeColor: string | null;
  keywords: string[] | null;
}

export async function fetchOGMetadata(url: string): Promise<OGMetadata> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'LinkPreviewAPI/1.0 (Google AI Studio)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      // Next.js fetch polyfill configuration
      next: { revalidate: 3600 }, // Cache minimum 1 hour by default
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try multiple selectors for each piece of metadata
    
    // 1. Title
    const title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      $('h1').first().text() ||
      null;

    // 2. Description
    const description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('p').first().text().substring(0, 300) ||
      null;

    // 3. Image
    let image = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[itemprop="image"]').attr('content') ||
      $('link[rel="image_src"]').attr('href') ||
      $('img').first().attr('src') ||
      null; // Note: You might want an image with reasonable size

    // 4. URL (canonical)
    const canonicalUrl = 
      $('meta[property="og:url"]').attr('content') ||
      $('link[rel="canonical"]').attr('href') ||
      response.url;

    // 5. Favicon
    let favicon = 
      $('link[rel="apple-touch-icon"]').attr('href') ||
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      '/favicon.ico';

    let domain = null;
    try {
      const parsedUrl = new URL(canonicalUrl);
      domain = parsedUrl.hostname;
      
      // Resolve relative image URLs
      if (image && !image.startsWith('http') && !image.startsWith('data:')) {
        image = new URL(image, canonicalUrl).href;
      }
      
      // Resolve relative favicon URLs
      if (favicon && !favicon.startsWith('http') && !favicon.startsWith('data:')) {
        favicon = new URL(favicon, canonicalUrl).href;
      }

    } catch (e) {
      // canonical might be relative, fall back to request URL
      try {
        const reqUrl = new URL(response.url);
        domain = reqUrl.hostname;
        
        if (image && !image.startsWith('http') && !image.startsWith('data:')) {
            image = new URL(image, response.url).href;
        }
        
        if (favicon && !favicon.startsWith('http') && !favicon.startsWith('data:')) {
            favicon = new URL(favicon, response.url).href;
        }
      } catch (err) {}
    }

    // Extended Metadata
    const type = $('meta[property="og:type"]').attr('content') || null;
    const siteName = $('meta[property="og:site_name"]').attr('content') || $('meta[name="application-name"]').attr('content') || null;
    const locale = $('meta[property="og:locale"]').attr('content') || $('html').attr('lang') || null;
    const articlePublishedTime = $('meta[property="article:published_time"]').attr('content') || null;
    const articleModifiedTime = $('meta[property="article:modified_time"]').attr('content') || null;
    const articleAuthor = $('meta[property="article:author"]').attr('content') || $('meta[name="author"]').attr('content') || null;
    const twitterCard = $('meta[name="twitter:card"]').attr('content') || null;
    const twitterSite = $('meta[name="twitter:site"]').attr('content') || null;
    const twitterCreator = $('meta[name="twitter:creator"]').attr('content') || null;
    const themeColor = $('meta[name="theme-color"]').attr('content') || null;
    
    const keywordsRaw = $('meta[name="keywords"]').attr('content') || '';
    const keywords = keywordsRaw ? keywordsRaw.split(',').map(k => k.trim()).filter(Boolean) : null;

    return {
      title: title ? title.trim() : null,
      description: description ? description.trim() : null,
      image,
      url: canonicalUrl,
      domain,
      favicon,
      type,
      siteName,
      locale,
      articlePublishedTime,
      articleModifiedTime,
      articleAuthor,
      twitterCard,
      twitterSite,
      twitterCreator,
      themeColor,
      keywords
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
