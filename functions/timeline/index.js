/**
 * Cloudflare Pages Function for /timeline
 *
 * Intercepts timeline view URL and returns index.html with OG tags.
 */

export async function onRequest(context) {
  const baseUrl = new URL(context.request.url);
  baseUrl.pathname = '/index.html';

  const indexResponse = await fetch(baseUrl.toString());
  let html = await indexResponse.text();

  const ogTags = buildTimelineOgTags(baseUrl.origin);

  html = injectOgTags(html, ogTags);
  html = injectPageMeta(html, ogTags);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
    },
  });
}

function buildTimelineOgTags(origin) {
  const title = 'Timeline: Operation Metro Surge | MN ICE Witness';
  const description = 'Interactive timeline of the Minnesota ICE enforcement crisis from December 2025 to present. Key events, running incident totals, and critical moments during Operation Metro Surge.';
  const url = `${origin}/timeline`;

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
  const metaTags = Object.entries(tags).map(([key, value]) => {
    const escapedValue = value.replace(/"/g, '&quot;');
    if (key.startsWith('og:')) {
      return `    <meta property="${key}" content="${escapedValue}">`;
    } else {
      return `    <meta name="${key}" content="${escapedValue}">`;
    }
  }).join('\n');

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
