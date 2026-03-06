const fs = require('fs');
const qs = JSON.parse(fs.readFileSync('exported_questions.json', 'utf8'));

function generateSlug(text, uuid) {
    const cleaned = text
        .replace(/\$\$[\s\S]+?\$\$/g, '')
        .replace(/\$[\s\S]+?\$/g, '')
        .replace(/\\text\{([^}]*)\}/g, '$1')
        .replace(/\\textbf\{([^}]*)\}/g, '$1')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/[{}\\^_]/g, '')
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .trim();
    const words = cleaned.split(/\s+/).filter(w => w.length > 1).slice(0, 6).map(w => w.toLowerCase());
    const shortUuid = uuid.replace(/-/g, '').slice(0, 8);
    return [...words, shortUuid].join('-');
}

console.log('=== All Question URLs ===\n');
qs.forEach((q, i) => {
    const s = generateSlug(q.question, q.uuid);
    console.log(`Q${i + 1}: https://www.prepaired.site/question/${s}`);
});
console.log('\n=== Copy-paste block ===\n');
qs.forEach((q, i) => {
    const s = generateSlug(q.question, q.uuid);
    console.log(`https://www.prepaired.site/question/${s}`);
});
