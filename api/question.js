export default async function handler(req, res) {
    const { uuid } = req.query;

    try {
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers['host'];
        const baseUrl = `${protocol}://${host}`;
        const siteUrl = 'https://www.prepaired.site';

        const [dataResponse, htmlResponse, chaptersResponse] = await Promise.all([
            fetch(`${baseUrl}/data/jee_2026_pyqs.json`),
            fetch(`${baseUrl}/index.html`),
            fetch(`${baseUrl}/chapters.json`)
        ]);

        if (!dataResponse.ok || !htmlResponse.ok) {
            throw new Error('Failed to fetch required static assets');
        }

        const data = await dataResponse.json();
        let html = await htmlResponse.text();
        const chapters = chaptersResponse.ok ? await chaptersResponse.json() : {};

        const question = data.find((q) => q.uuid === uuid);

        if (question) {
            // Build chapter code -> chapter name lookup
            const chapterMap = {};
            for (const subject of Object.keys(chapters)) {
                for (const ch of chapters[subject]) {
                    chapterMap[ch.code] = { name: ch.name, subject };
                }
            }

            const tag2 = question.tags?.tag2 || '';
            const chapterInfo = chapterMap[tag2] || {};
            const chapterName = chapterInfo.name || '';
            const subjectName = chapterInfo.subject || question.subject || 'Practice';
            const shiftInfo = question.tags?.tag1 || '';

            // Create a clean plain text version
            const plainText = question.text
                .replace(/\$\$[\s\S]+?\$\$/g, '[equation]')
                .replace(/\$[\s\S]+?\$/g, '[formula]')
                .replace(/\\text\{([^}]*)\}/g, '$1')
                .replace(/\\textbf\{([^}]*)\}/g, '$1')
                .replace(/\\[a-zA-Z]+/g, '')
                .replace(/[{}\\^_]/g, '')
                .replace(/\n/g, ' ')
                .trim();

            const shortText = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

            // Build rich, keyword-dense title
            const titleParts = ['JEE Main 2026 PYQ'];
            if (chapterName) titleParts.push(chapterName);
            if (subjectName && subjectName !== 'Practice') titleParts.push(subjectName);
            titleParts.push('prepAIred');
            const title = titleParts.join(' | ');

            // Rich description
            const description = `JEE Main 2026 Previous Year Question${chapterName ? ` from ${chapterName}` : ''}${subjectName !== 'Practice' ? ` (${subjectName})` : ''}${shiftInfo ? ` - ${shiftInfo}` : ''}. ${shortText} Practice with detailed solution on prepAIred.`;

            const canonicalUrl = `${siteUrl}/pyq/${uuid}`;

            // Replace title
            html = html.replace(
                /<title>.*?<\/title>/,
                `<title>${escapeHtml(title)}</title>`
            );

            // Replace meta title
            html = html.replace(
                /<meta name="title" content="[^"]*"/,
                `<meta name="title" content="${escapeAttr(title)}"`
            );

            // Replace meta description
            html = html.replace(
                /<meta name="description"[\s\S]*?\/>/,
                `<meta name="description" content="${escapeAttr(description)}" />`
            );

            // Replace canonical
            html = html.replace(
                /<link rel="canonical" href="[^"]*"/,
                `<link rel="canonical" href="${canonicalUrl}"`
            );

            // Replace OG tags
            html = html.replace(
                /<meta property="og:url" content="[^"]*"/,
                `<meta property="og:url" content="${canonicalUrl}"`
            );
            html = html.replace(
                /<meta property="og:title" content="[^"]*"/,
                `<meta property="og:title" content="${escapeAttr(title)}"`
            );
            html = html.replace(
                /<meta property="og:description"[\s\S]*?\/>/,
                `<meta property="og:description" content="${escapeAttr(description)}" />`
            );
            html = html.replace(
                /<meta property="og:type" content="[^"]*"/,
                `<meta property="og:type" content="article"`
            );

            // Replace Twitter tags
            html = html.replace(
                /<meta name="twitter:url" content="[^"]*"/,
                `<meta name="twitter:url" content="${canonicalUrl}"`
            );
            html = html.replace(
                /<meta name="twitter:title" content="[^"]*"/,
                `<meta name="twitter:title" content="${escapeAttr(title)}"`
            );
            html = html.replace(
                /<meta name="twitter:description"[\s\S]*?\/>/,
                `<meta name="twitter:description" content="${escapeAttr(description)}" />`
            );

            // Add keywords meta
            const keywords = [
                'JEE Main 2026 PYQ', 'JEE 2026 previous year questions',
                subjectName, chapterName,
                'JEE Main 2026 solutions', 'JEE PYQ with solution',
                'prepAIred', shiftInfo,
                'JEE Main practice questions', 'JEE Advanced preparation'
            ].filter(Boolean).join(', ');

            // Inject additional SEO tags before </head>
            const seoInjection = `
    <meta name="keywords" content="${escapeAttr(keywords)}" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      "name": "${escapeJson(title)}",
      "description": "${escapeJson(description)}",
      "url": "${canonicalUrl}",
      "dateCreated": "2026-01-01T00:00:00Z",
      "educationalLevel": "Higher Secondary",
      "about": {
        "@type": "Thing",
        "name": "${escapeJson(chapterName || subjectName)}"
      },
      "provider": {
        "@type": "EducationalOrganization",
        "name": "prepAIred",
        "url": "${siteUrl}/"
      },
      "educationalAlignment": {
        "@type": "AlignmentObject",
        "alignmentType": "educationalSubject",
        "educationalFramework": "JEE Main 2026",
        "targetName": "${escapeJson(subjectName)}",
        "targetDescription": "${escapeJson(chapterName)}"
      },
      "isAccessibleForFree": true,
      "inLanguage": "en"
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "${siteUrl}/" },
        { "@type": "ListItem", "position": 2, "name": "JEE 2026 PYQs", "item": "${siteUrl}/pyq-2026" },
        { "@type": "ListItem", "position": 3, "name": "${escapeJson(subjectName)}", "item": "${siteUrl}/pyq-2026/${subjectName.toLowerCase()}" },
        { "@type": "ListItem", "position": 4, "name": "${escapeJson(chapterName || 'Question')}", "item": "${canonicalUrl}" }
      ]
    }
    </script>
`;
            html = html.replace('</head>', seoInjection + '</head>');
        }

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
        res.status(200).send(html);
    } catch (error) {
        console.error('SEO Injection Error:', error);
        res.redirect(302, '/');
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeJson(str) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}
