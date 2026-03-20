export default async function handler(req, res) {
    try {
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers['host'];
        const baseUrl = `${protocol}://${host}`;
        const siteUrl = 'https://www.prepaired.site';
        const today = new Date().toISOString().split('T')[0];

        // Fetch PYQ data
        const dataResponse = await fetch(`${baseUrl}/data/jee_2026_pyqs.json`);
        const pyqData = dataResponse.ok ? await dataResponse.json() : [];

        // Fetch chapters data
        const chaptersResponse = await fetch(`${baseUrl}/chapters.json`);
        const chaptersData = chaptersResponse.ok ? await chaptersResponse.json() : {};

        // Fetch organic questions list
        // We'll extract slugs from the organic questions module at build time
        // For now, include the organic index page
        const organicSlugs = await getOrganicSlugs(baseUrl);

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Static Pages -->
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/pyq-2026</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/questions/organic</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/pricing</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Subject-wise PYQ Pages -->
  <url>
    <loc>${siteUrl}/pyq-2026/physics</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/pyq-2026/chemistry</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/pyq-2026/mathematics</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

        // Individual PYQ pages (730+ questions)
        for (const q of pyqData) {
            if (!q.uuid) continue;
            const subject = q.subject || q.tags?.subject || 'Practice';
            xml += `  <url>
    <loc>${siteUrl}/pyq/${q.uuid}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
        }

        // Organic chemistry question pages
        for (const slug of organicSlugs) {
            xml += `  <url>
    <loc>${siteUrl}/question/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
        }

        xml += `</urlset>`;

        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.status(200).send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        // Return minimal sitemap on error
        const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.prepaired.site/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
        res.setHeader('Content-Type', 'application/xml');
        res.status(200).send(fallback);
    }
}

/**
 * Extract organic question slugs.
 * Since the organic questions are in a TypeScript module, we maintain a
 * known list here. This should be updated when new organic questions are added.
 */
async function getOrganicSlugs(baseUrl) {
    // These are the known organic question slugs from organicQuestions.ts
    // The slugs are generated from question text + uuid prefix
    // We'll try to fetch them from a manifest, or return the known list
    try {
        const response = await fetch(`${baseUrl}/data/organic-slugs.json`);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        // Fall through to hardcoded list
    }

    // Return empty array - we'll generate the manifest in a build step
    return [];
}
