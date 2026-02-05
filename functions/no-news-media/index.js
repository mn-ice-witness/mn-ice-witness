/**
 * Cloudflare Pages Function for /no-news-media
 *
 * Intercepts the no-news-media page URL, injects Open Graph meta tags for social media sharing,
 * and returns the main index.html.
 */

export async function onRequest(context) {
  // Fetch the base index.html
  const baseUrl = new URL(context.request.url);
  baseUrl.pathname = '/index.html';

  const indexResponse = await fetch(baseUrl.toString());
  let html = await indexResponse.text();

  // Build OG meta tags for no-news-media page
  const ogTags = buildNoNewsMediaOgTags(baseUrl.origin);

  // Inject OG tags and page-specific title/canonical/description into <head>
  html = injectOgTags(html, ogTags);
  html = injectPageMeta(html, ogTags);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
    },
  });
}

function buildNoNewsMediaOgTags(origin) {
  const title = 'No News Media | MN ICE Witness';
  const description = 'Incidents documented by social media and eyewitnesses. Help us find press coverage.';
  const url = `${origin}/no-news-media`;

  return {
    'og:title': title,
    'og:description': description,
    'og:url': url,
    'og:image': `${origin}/assets/og-image.jpg`,
    'og:type': 'website',
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': `${origin}/assets/og-image.jpg`,
  };
}

function injectPageMeta(html, tags) {
  const title = tags['og:title'];
  const desc = tags['og:description'];
  const url = tags['og:url'];
  const escapedTitle = title.replace(/"/g, '&quot;');
  const escapedDesc = desc.replace(/"/g, '&quot;');
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapedTitle}</title>`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapedDesc}">`);
  return html;
}

function injectOgTags(html, tags) {
  // Build new meta tags string
  const metaTags = Object.entries(tags).map(([key, value]) => {
    const escapedValue = value.replace(/"/g, '&quot;');
    if (key.startsWith('og:')) {
      return `    <meta property="${key}" content="${escapedValue}">`;
    } else {
      return `    <meta name="${key}" content="${escapedValue}">`;
    }
  }).join('\n');

  // Replace the entire OG/Twitter section in one operation
  if (html.includes('<!-- Open Graph / Social Media -->')) {
    html = html.replace(
      /<!-- Open Graph \/ Social Media -->[\s\S]*?<!-- Twitter Card -->[\s\S]*?<meta name="twitter:image"[^>]*>/,
      `<!-- Open Graph / Social Media -->\n${metaTags}`
    );
  } else {
    html = html.replace('</head>', `${metaTags}\n</head>`);
  }

  return html;
}
