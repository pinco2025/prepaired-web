/**
 * Pre-build script: Extracts organic question slugs from organicQuestions.ts
 * and writes them to public/data/organic-slugs.json for the sitemap API.
 */
const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '..', 'client', 'src', 'data', 'organicQuestions.ts');
const outputFile = path.join(__dirname, '..', 'client', 'public', 'data', 'organic-slugs.json');

// Read the TypeScript source
const source = fs.readFileSync(sourceFile, 'utf-8');

// Extract uuid values from rawQuestions array
const uuidRegex = /uuid:\s*["']([^"']+)["']/g;
const uuids = [];
let match;
while ((match = uuidRegex.exec(source)) !== null) {
    uuids.push(match[1]);
}

// Replicate the generateSlug function from organicQuestions.ts
function generateSlug(text, uuid) {
    const cleaned = text
        .replace(/\$\$[\s\S]+?\$\$/g, '')
        .replace(/\$[\s\S]+?\$/g, '')
        .replace(/\\text\{([^}]*)\}/g, '$1')
        .replace(/\\textbf\{([^}]*)\}/g, '$1')
        .replace(/\\textit\{([^}]*)\}/g, '$1')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/[{}\\^_]/g, '')
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .trim();

    const words = cleaned
        .split(/\s+/)
        .filter(w => w.length > 1)
        .slice(0, 6)
        .map(w => w.toLowerCase());

    const shortUuid = uuid.replace(/-/g, '').slice(0, 8);
    return [...words, shortUuid].join('-');
}

// Extract question texts and generate slugs
const questionRegex = /uuid:\s*["']([^"']+)["'],\s*\n\s*question:\s*["'`]([\s\S]*?)["'`],\s*\n\s*question_image/g;
const slugs = [];

// Simpler approach: extract uuid + question pairs
const entries = source.split(/\{\s*\n\s*uuid:/);
for (const entry of entries.slice(1)) { // skip first empty split
    const uuidMatch = entry.match(/^\s*["']([^"']+)["']/);
    const questionMatch = entry.match(/question:\s*["'`]([\s\S]*?)["'`],\s*\n\s*question_image/);

    if (uuidMatch && questionMatch) {
        const slug = generateSlug(questionMatch[1], uuidMatch[1]);
        slugs.push(slug);
    }
}

// Ensure output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(slugs, null, 2));
console.log(`Generated ${slugs.length} organic question slugs to ${outputFile}`);
