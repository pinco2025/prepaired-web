export default async function handler(req, res) {
    const { uuid } = req.query;

    try {
        // Determine the host to construct the absolute URL for the fetch
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers['host'];
        const baseUrl = `${protocol}://${host}`;

        // Fetch the data and the index.html via the deployed Vercel environment
        // We fetch from the same deployment so we don't need fs path tracing
        const dataResponse = await fetch(`${baseUrl}/data/jee_2026_pyqs.json`);
        const htmlResponse = await fetch(`${baseUrl}/index.html`);

        if (!dataResponse.ok || !htmlResponse.ok) {
            throw new Error('Failed to fetch required static assets');
        }

        const data = await dataResponse.json();
        let html = await htmlResponse.text();

        const question = data.find((q) => q.uuid === uuid);

        if (question) {
            // Create a plain text version of the question for the SEO tags
            // Handle math/markdown simply by taking the raw text. 
            const plainText = question.text
                .replace(/\n/g, ' ')
                .substring(0, 150) + '...';

            const title = `JEE 2026 PYQ: ${question.subject || 'Practice'} Question | prepAIred.in`;

            // Replace the fallback title and meta description
            html = html.replace(
                /<title>.*?<\/title>/,
                `<title>${title}</title>`
            );

            html = html.replace(
                /<meta name="description" content="[^"]*"/,
                `<meta name="description" content="${plainText.replace(/"/g, '&quot;')}"`
            );

            // Inject JSON-LD Schema
            const schemaData = {
                "@context": "https://schema.org",
                "@type": "Question",
                "name": title,
                "text": plainText,
                "dateCreated": "2026-01-01T00:00:00Z"
            };

            html = html.replace(
                '</head>',
                `<script type="application/ld+json">\n${JSON.stringify(schemaData, null, 2)}\n</script>\n</head>`
            );
        }

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache at edge for 24h
        res.status(200).send(html);
    } catch (error) {
        console.error('SEO Injection Error:', error);
        // Fallback: send them to the root or basic index
        res.redirect(302, '/');
    }
}
