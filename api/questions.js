/**
 * Server-side proxy for question set fetching.
 *
 * - Hides the GitHub repo URL from the client
 * - Enforces the free-tier question limit server-side
 * - Decrypts .enc files server-side so the key never reaches the browser
 *
 * Usage:
 *   GET /api/questions?setId=condensed&subject=physics
 *   Authorization: Bearer <supabase_jwt>   (optional — omit for free-tier access)
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FREE_QUESTION_LIMIT = 10;
const PAID_TIERS = ['lite', 'ipft-01-2026'];
const OBFUSCATION_KEY = 'pRePaIrEd2026sEcReT';

// ── Decryption (ported from client cryptoUtils.ts) ──────────────────────────

function xorTransform(input, key) {
    let result = '';
    for (let i = 0; i < input.length; i++) {
        result += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

function decryptData(encryptedString) {
    const decoded = Buffer.from(encryptedString, 'base64').toString('utf-8');
    return xorTransform(decoded, OBFUSCATION_KEY);
}

// ── Shuffle (Fisher-Yates) ──────────────────────────────────────────────────

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function transformGitHubUrl(url) {
    let baseUrl = url.replace(/\/$/, '');
    if (baseUrl.includes('github.com')) {
        baseUrl = baseUrl
            .replace('https://github.com/', 'https://raw.githubusercontent.com/')
            .replace('/tree/', '/')
            .replace('/blob/', '/');
    }
    return baseUrl;
}

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(`Response from ${url} is not valid JSON (got HTML or empty body)`);
    }
}

async function fetchAndDecrypt(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
    const encrypted = await res.text();
    const json = decryptData(encrypted);
    return JSON.parse(json);
}

// ── Build solution map ──────────────────────────────────────────────────────

function buildSolutionMap(rawSolutions, setId, allowedIds) {
    const solMap = {};

    if (setId === 'neet-phy') {
        (Array.isArray(rawSolutions) ? rawSolutions : []).forEach(sol => {
            if (sol.uuid && allowedIds.has(sol.uuid)) {
                solMap[sol.uuid] = {
                    text: sol.solution_text || '',
                    image: sol.solution_image_url || null,
                };
            }
        });
    } else if (rawSolutions.questions) {
        rawSolutions.questions.forEach(sol => {
            if (allowedIds.has(sol.id)) {
                solMap[sol.id] = {
                    text: sol.solution_text || '',
                    image: sol.solution_image_url || null,
                };
            }
        });
    }

    return solMap;
}

// ── NEET question normalizer ────────────────────────────────────────────────

function normalizeNeetQuestions(rawQuestions, setId, subject) {
    return {
        setId,
        subject,
        totalQuestions: rawQuestions.length,
        exportedAt: new Date().toISOString(),
        questions: rawQuestions.map((q, index) => ({
            id: q.uuid || `q${index}`,
            uuid: q.uuid || `q${index}`,
            text: q.question,
            image: q.question_image_url || null,
            options: [
                { id: 'a', text: q.option_a, image: q.option_a_image_url || null },
                { id: 'b', text: q.option_b, image: q.option_b_image_url || null },
                { id: 'c', text: q.option_c, image: q.option_c_image_url || null },
                { id: 'd', text: q.option_d, image: q.option_d_image_url || null },
            ].filter(opt => opt.text || opt.image),
            correctAnswer: q.answer?.toLowerCase(),
            chapterCode: q.tag_2 || null,
            year: q.year || null,
            type: q.type || null,
        })),
    };
}

// ── Main handler ────────────────────────────────────────────────────────────

export default async function handler(req, res) {
    const { setId, subject } = req.query;

    if (!setId) {
        return res.status(400).json({ error: 'Missing setId parameter' });
    }

    // Super-30 doesn't need a subject; everything else does
    if (setId !== 'super-30' && !subject) {
        return res.status(400).json({ error: 'Missing subject parameter' });
    }

    try {
        // Guard: env vars must be set in Vercel
        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            console.error('[api/questions] Missing env vars: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
            return res.status(500).json({ error: 'Server misconfiguration: missing env vars' });
        }

        // ── 1. Authenticate & determine tier ────────────────────────────
        let isPaid = false;
        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (token) {
            // Validate JWT via Supabase Auth REST API
            const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': SUPABASE_SERVICE_KEY,
                },
            });

            if (!userRes.ok) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }

            const user = await userRes.json();

            // Fetch subscription tier from users table
            const profileRes = await fetch(
                `${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}&select=subscription_tier`,
                {
                    headers: {
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    },
                }
            );

            if (profileRes.ok) {
                const profiles = await profileRes.json();
                if (profiles.length > 0) {
                    const tier = (profiles[0].subscription_tier || '').toLowerCase();
                    isPaid = PAID_TIERS.includes(tier);
                }
            }
        }

        // ── 2a. Chapter-specific sets (from AI Insights weak chapters) ──
        if (setId.startsWith('ch-')) {
            const chapterCode = setId.slice(3);

            const recRes = await fetch(
                `${SUPABASE_URL}/rest/v1/question_set?set_id=eq.recommend&select=url`,
                {
                    headers: {
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    },
                }
            );
            if (!recRes.ok) {
                return res.status(500).json({ error: 'Failed to look up recommend set' });
            }
            const recSets = await recRes.json();
            if (!recSets.length || !recSets[0].url) {
                return res.status(404).json({ error: 'Recommend set not configured' });
            }
            const baseUrl = transformGitHubUrl(recSets[0].url);
            const cap = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
            const qUrl = `${baseUrl}/${cap}/${chapterCode}/${chapterCode}_${cap}_questions.json`;
            const sUrl = `${baseUrl}/${cap}/${chapterCode}/${chapterCode}_${cap}_solutions.json`;

            // Existence check — GET the file and verify it parses as JSON
            if (req.query.check === '1') {
                const checkRes = await fetch(qUrl);
                if (!checkRes.ok) {
                    return res.status(404).json({ exists: false });
                }
                try {
                    const text = await checkRes.text();
                    JSON.parse(text);
                    return res.status(200).json({ exists: true });
                } catch {
                    return res.status(404).json({ exists: false });
                }
            }

            const [rawQ, rawS] = await Promise.all([
                fetchJson(qUrl),
                fetchJson(sUrl).catch(() => null),
            ]);

            const allQs = rawQ.questions || [];
            const allowedIds = new Set(allQs.map(q => q.id));
            const solutions = rawS ? buildSolutionMap(rawS, setId, allowedIds) : {};

            res.setHeader('Cache-Control', 'no-store');
            return res.status(200).json({
                questions: allQs,
                solutions,
                totalCount: allQs.length,
                isPaid: true,
                sourceUrl: qUrl,
            });
        }

        // ── 2. Fetch question-set URL from Supabase ─────────────────────
        const setRes = await fetch(
            `${SUPABASE_URL}/rest/v1/question_set?set_id=eq.${encodeURIComponent(setId)}&select=url`,
            {
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                },
            }
        );

        if (!setRes.ok) {
            return res.status(500).json({ error: 'Failed to look up question set' });
        }

        const sets = await setRes.json();
        if (!sets.length || !sets[0].url) {
            return res.status(404).json({ error: 'Question set not found' });
        }

        const baseUrl = transformGitHubUrl(sets[0].url);

        // ── 3. Super-30 — return all 4 files (free for everyone) ────────
        if (setId === 'super-30') {
            const [pyq, ipq, ipqSol, pyqSol] = await Promise.all([
                fetchJson(`${baseUrl}/PYQ.json`),
                fetchJson(`${baseUrl}/IPQ.json`),
                fetchJson(`${baseUrl}/IPQ_sol.json`),
                fetchJson(`${baseUrl}/PYQ_sol.json`),
            ]);

            res.setHeader('Cache-Control', 'no-store');
            return res.status(200).json({ pyq, ipq, ipqSol, pyqSol });
        }

        // ── 4. Standard sets — fetch questions + solutions ──────────────
        const isCondensed = setId === 'condensed';
        const fetchFn = isCondensed ? fetchAndDecrypt : fetchJson;
        const fileExt = isCondensed ? '.enc' : '.json';

        let questionUrl, solutionUrl;

        if (setId === 'neet-phy') {
            questionUrl = `${baseUrl}/${subject}/exported_questions.json`;
            solutionUrl = `${baseUrl}/${subject}/exported_solutions.json`;
        } else {
            const cap = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
            questionUrl = `${baseUrl}/${cap}_questions${fileExt}`;
            solutionUrl = `${baseUrl}/${cap}_solutions${fileExt}`;
        }

        // Fetch questions (required) and solutions (best-effort) in parallel
        const [rawQuestions, rawSolutions] = await Promise.all([
            fetchFn(questionUrl),
            fetchFn(solutionUrl).catch(() => null),
        ]);

        // Normalize NEET format if needed
        const questionsData = setId === 'neet-phy'
            ? normalizeNeetQuestions(rawQuestions, setId, subject)
            : rawQuestions;

        const allQuestions = questionsData.questions || [];
        const totalCount = allQuestions.length;

        // Paid users get shuffled questions; free users get the first N in original order
        const selectedQuestions = isPaid
            ? shuffleArray(allQuestions)
            : allQuestions.slice(0, FREE_QUESTION_LIMIT);

        // Build a set of allowed IDs so we only send matching solutions
        const allowedIds = new Set(selectedQuestions.map(q => q.id));

        const solutions = rawSolutions
            ? buildSolutionMap(rawSolutions, setId, allowedIds)
            : {};

        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({
            questions: selectedQuestions,
            solutions,
            totalCount,
            isPaid,
            sourceUrl: questionUrl,
        });

    } catch (err) {
        console.error('[api/questions] Error:', err?.message || err);
        return res.status(500).json({ error: err?.message || 'Internal server error' });
    }
}
