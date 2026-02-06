/**
 * Cloudflare Pages Function for /list and /list/[category]
 *
 * Intercepts list view URLs and returns index.html.
 *
 * [[category]] matches:
 *   /list           → category = undefined
 *   /list/citizens  → category = ['citizens']
 */

export async function onRequest(context) {
  const { params } = context;
  const categorySegments = params.category || [];
  const category = categorySegments[0] || null;

  // Fetch the base index.html
  const baseUrl = new URL(context.request.url);
  baseUrl.pathname = '/index.html';

  const indexResponse = await fetch(baseUrl.toString());
  let html = await indexResponse.text();

  // Build OG meta tags
  const ogTags = buildListOgTags(baseUrl.origin, category);

  // Inject OG tags and page-specific title/canonical/description into <head>
  html = injectOgTags(html, ogTags);
  html = injectPageMeta(html, ogTags);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
    },
  });
}

function buildListOgTags(origin, category) {
  const categories = {
    'citizens': {
      title: 'U.S. Citizens & Legal Residents Detained by ICE',
      description: 'Documented incidents of U.S. citizens and legal residents wrongly detained, stopped, or racially profiled by ICE agents in Minnesota during Operation Metro Surge.',
    },
    'observers': {
      title: 'Observers & Protesters Targeted by ICE',
      description: 'Documented incidents of observers, protesters, and journalists arrested, pepper sprayed, or attacked while filming ICE operations in Minnesota.',
    },
    'immigrants': {
      title: 'Immigration Arrests & Detentions in Minnesota',
      description: 'Documented ICE arrests and detentions of community members in Minnesota. Includes workplace raids, family separations, and deportations during Operation Metro Surge.',
    },
    'schools-hospitals': {
      title: 'ICE Activity Near Schools & Hospitals in Minnesota',
      description: 'Documented ICE/CBP enforcement actions at or near schools, daycares, and hospitals in Minnesota. Includes school lockdowns, student detentions, and disruptions.',
    },
    'response': {
      title: 'Official DHS & ICE Statements on Minnesota Operations',
      description: 'Official DHS, ICE, and federal government statements and responses regarding enforcement operations in Minnesota during Operation Metro Surge.',
    },
    'background': {
      title: 'Background & Context | Operation Metro Surge',
      description: 'Major events, legal actions, protests, and political developments that shaped the ICE crisis in Minnesota during Operation Metro Surge.',
    },
  };

  const categoryInfo = category ? categories[category] : null;

  const title = categoryInfo
    ? `${categoryInfo.title} | MN ICE Witness`
    : 'All Incidents | MN ICE Witness';

  const description = categoryInfo
    ? categoryInfo.description
    : 'Complete list of documented ICE and CBP civil rights incidents in Minnesota during Operation Metro Surge.';

  const url = category
    ? `${origin}/list/${category}`
    : `${origin}/list`;

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
