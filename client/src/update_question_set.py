import re

file_path = "c:/Users/Harshit Sayal/Desktop/BDP/prepAIred/prepaired-dev/prepaired-web/client/src/components/QuestionSet.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update ViewStates
content = content.replace(
    "const [viewState, setViewState] = useState<'dashboard' | 'condensed_selection' | 'statement_parts' | 'statement_subjects'>(",
    "const [viewState, setViewState] = useState<'dashboard' | 'subject_selection'>("
)
content = content.replace(
    "const [statementPart, setStatementPart] = useState<'part1' | 'part2' | null>(null);",
    "const [selectedSet, setSelectedSet] = useState<string | null>((location.state as any)?.selectedSet || null);"
)

# 2. Update Actions in Dashboard Items
content = content.replace(
    "action: () => setViewState('condensed_selection'),",
    "action: () => { setSelectedSet('condensed_main'); setViewState('subject_selection'); },"
)
content = content.replace(
    "action: () => {},\n            classes: {\n                badgeBg: 'bg-amber-500',",
    "action: () => { setSelectedSet('accuracy'); setViewState('subject_selection'); },\n            classes: {\n                badgeBg: 'bg-amber-500',"
)
content = content.replace(
    "action: () => setViewState('statement_parts'),",
    "action: () => { setSelectedSet('statement'); setViewState('subject_selection'); },"
)
content = content.replace(
    "action: () => {},\n            classes: {\n                badgeBg: 'bg-emerald-500',",
    "action: () => { setSelectedSet('level2'); setViewState('subject_selection'); },\n            classes: {\n                badgeBg: 'bg-emerald-500',"
)

# 3. Headers and back button
headers_old = """                        <h1 className="text-text-light dark:text-text-dark text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                            {viewState === 'dashboard' ? 'Explore Question Sets' :
                                viewState === 'statement_parts' ? 'Select Part' :
                                    'Select Subject'}
                        </h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal max-w-2xl mt-2">
                            {viewState === 'dashboard'
                                ? 'Browse our curated collection of high-yield question sets designed to maximize your prep efficiency.'
                                : viewState === 'statement_parts'
                                    ? 'Choose between Part 1 and Part 2 of the Statement Based Questions.'
                                    : 'Choose a subject to start practicing.'}
                        </p>"""

headers_new = """                        <h1 className="text-text-light dark:text-text-dark text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                            {viewState === 'dashboard' ? 'Explore Question Sets' : 'Select Subject'}
                        </h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal max-w-2xl mt-2">
                            {viewState === 'dashboard'
                                ? 'Browse our curated collection of high-yield question sets designed to maximize your prep efficiency.'
                                : 'Choose a subject to start practicing.'}
                        </p>"""
content = content.replace(headers_old, headers_new)

back_old = """                    {viewState !== 'dashboard' && (
                        <div>
                            <button
                                onClick={() => {
                                    if (viewState === 'statement_subjects') {
                                        setViewState('statement_parts');
                                        setStatementPart(null);
                                    } else {
                                        setViewState('dashboard');
                                    }
                                }}
                                className="flex items-center gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                {viewState === 'statement_subjects' ? 'Back to Parts' : 'Back to All Sets'}
                            </button>
                        </div>
                    )}"""

back_new = """                    {viewState !== 'dashboard' && (
                        <div>
                            <button
                                onClick={() => {
                                    setViewState('dashboard');
                                    setSelectedSet(null);
                                }}
                                className="flex items-center gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back to All Sets
                            </button>
                        </div>
                    )}"""
content = content.replace(back_old, back_new)

# 4. Replace statementSubjects and parts handlers
parts_logic_pattern = r"(    const handleStatementPartSelect \= \(part\: \'part1\' \| \'part2\'\).*?navigate\(\`/question-set/statement-\$\{statementPart\}-\$\{subjectId\}/practice\`\);\n    \};\n)"

new_subjects_code = """    const fastTrackSubjects = [
        {
            id: 'physics',
            name: 'Physics',
            title: 'Physics - Fast Track',
            description: 'A set comprised to provide maximum marks in minimum time. Essential drills for mechanics and modern physics.',
            stats: { questions: 'Variable Qs', time: 'Depends', difficulty: 'Medium' },
            tags: ['Speed', 'Precision'],
            image: phyImg,
            classes: {
                badgeBg: 'bg-amber-500',
                tagMain: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
            }
        },
        {
            id: 'chemistry',
            name: 'Chemistry',
            title: 'Chemistry - Fast Track',
            description: 'Maximize your scoring rate with these high-frequency chemistry drills.',
            stats: { questions: 'Variable Qs', time: 'Depends', difficulty: 'Medium' },
            tags: ['Speed', 'Precision'],
            image: chemImg,
            classes: {
                badgeBg: 'bg-amber-500',
                tagMain: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
            }
        }
    ];

    const level2Subjects = [
        {
            id: 'physics',
            name: 'Physics',
            title: 'Physics - 360° Set',
            description: 'Full coverage rank booster questions for complete preparation.',
            stats: { questions: 'Rank Booster', time: 'Variable', difficulty: 'Hard' },
            tags: ['Rank Booster', 'High Difficulty'],
            image: phyImg,
            classes: {
                badgeBg: 'bg-emerald-500',
                tagMain: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
                titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
            }
        },
        {
            id: 'chemistry',
            name: 'Chemistry',
            title: 'Chemistry - 360° Set',
            description: 'The ultimate final revision covering tricky edge-cases and exceptions.',
            stats: { questions: 'Rank Booster', time: 'Variable', difficulty: 'Hard' },
            tags: ['Rank Booster', 'High Difficulty'],
            image: chemImg,
            classes: {
                badgeBg: 'bg-emerald-500',
                tagMain: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
                titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
            }
        },
        {
            id: 'mathematics',
            name: 'Mathematics',
            title: 'Mathematics - 360° Set',
            description: 'Complex multi-concept problems to solidify your edge in Mathematics.',
            stats: { questions: 'Rank Booster', time: 'Variable', difficulty: 'Hard' },
            tags: ['Rank Booster', 'High Difficulty'],
            image: mathImg,
            classes: {
                badgeBg: 'bg-emerald-500',
                tagMain: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
                titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
            }
        }
    ];

    const statementSubjects = [
        {
            id: 'physics',
            name: 'Physics',
            title: 'Physics - Statement Based',
            description: 'Master assertion-reason and statement-based questions in Physics.',
            stats: { questions: '60 Qs', time: '5 Hrs', difficulty: 'Medium' },
            tags: ['Assertion-Reason'],
            image: phyImg,
            classes: {
                badgeBg: 'bg-rose-500',
                tagMain: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
                titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
            }
        },
        {
            id: 'chemistry',
            name: 'Chemistry',
            title: 'Chemistry - Statement Based',
            description: 'Master statement-based formats covering Physical, Inorganic, and Organic Chemistry.',
            stats: { questions: '60 Qs', time: '5 Hrs', difficulty: 'Medium' },
            tags: ['Statement Based'],
            image: chemImg,
            classes: {
                badgeBg: 'bg-rose-500',
                tagMain: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
                titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
            }
        },
        {
            id: 'mathematics',
            name: 'Mathematics',
            title: 'Mathematics - Statement Based',
            description: 'Tackle statement and assertion questions for Algebra and Calculus.',
            stats: { questions: '60 Qs', time: '5 Hrs', difficulty: 'Hard' },
            tags: ['Statement Based'],
            image: mathImg,
            classes: {
                badgeBg: 'bg-rose-500',
                tagMain: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
                titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
            }
        }
    ];

    const getActiveSubjects = () => {
        if (selectedSet === 'accuracy') return fastTrackSubjects;
        if (selectedSet === 'level2') return level2Subjects;
        if (selectedSet === 'statement') return statementSubjects;
        return condensedSubjects;
    };

    const handleStartPractice = (subjectId: string) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!selectedSet) return;
        const dbSetId = ITEM_SET_ID[selectedSet] || 'condensed';
        navigate(`/question-set/${dbSetId}/${subjectId}/practice`);
    };
"""
content = re.sub(parts_logic_pattern, new_subjects_code, content, flags=re.DOTALL)

# 5. Remove the huge statement_parts, statement_subjects, condensed_selection logic
blocks_pattern = r"(\{\/\* Statement Parts Selection View \*\/\}.*?navigate\(\`/question-set/\$\{subject\.id\}/practice\`\);\n            \}\n        \}\}\n        className=\"flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-\[0\.98\] bg-primary text-white shadow-md shadow-blue-500\/20 hover:bg-primary-dark hover:shadow-lg hover:shadow-blue-500\/30\"\n    \>\n        Start Practice\n        \<span className=\"material-symbols-outlined text-\[18px\]\"\>arrow_forward\<\/span\>\n    \<\/button\>\n\<\/div\>\n\<\/div\>\n\<\/div\>\n\)\)}\n\<\/div\>\n\)\})"
new_view_state_ui = """                    {/* Subject Selection View */}
                    {viewState === 'subject_selection' && (
                        <div className="grid grid-cols-1 gap-5">
                            {getActiveSubjects().map((subject) => (
                                <div
                                    key={subject.id}
                                    className="group relative flex flex-col md:flex-row bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark overflow-hidden hover:shadow-[0_8px_24px_rgb(19,91,236,0.08)] hover:border-primary/30 transition-all duration-300"
                                >
                                    {/* Image Section */}
                                    <div className="md:w-56 h-36 md:h-auto bg-black relative overflow-hidden shrink-0 flex items-center justify-center p-4">
                                        {subject.image && (
                                            <div
                                                className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                                                style={{ backgroundImage: `url("${subject.image}")` }}
                                            />
                                        )}
                                        {subject.tags && (
                                            <div className="md:hidden absolute bottom-2 left-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-white ${subject.classes.badgeBg}`}>
                                                    {subject.tags[0]}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    {subject.tags && subject.tags.map((tag, idx) => (
                                                        <span key={idx} className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                                                            ${idx === 0
                                                                ? subject.classes.tagMain
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                            }`}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                                                    ${subject.stats.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        subject.stats.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            subject.stats.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                                                    <span>{subject.stats.difficulty}</span>
                                                </div>
                                            </div>

                                            <h3 className={`text-text-light dark:text-text-dark text-lg md:text-xl font-bold mb-1 transition-colors ${subject.classes.titleHover}`}>
                                                {subject.title}
                                            </h3>
                                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs md:text-sm leading-relaxed line-clamp-2">
                                                {subject.description}
                                            </p>
                                        </div>

                                        <div className="mt-4 md:mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-border-light dark:border-border-dark pt-3 md:pt-4">
                                            <div className="flex items-center gap-4 text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                <div className="flex items-center gap-1.5" title="Items">
                                                    <span className="material-symbols-outlined text-[16px] md:text-[18px]">format_list_numbered</span>
                                                    <span className="font-medium">{subject.stats.questions}</span>
                                                </div>
                                                <div className="hidden md:flex items-center gap-1.5" title="Estimated Time">
                                                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                                                    <span className="font-medium">{subject.stats.time}</span>
                                                </div>
                                                <div className="hidden md:flex items-center gap-1.5" title="Difficulty">
                                                    <span className="material-symbols-outlined text-[18px]">signal_cellular_alt</span>
                                                    <span className="font-medium">{subject.stats.difficulty}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleStartPractice(subject.id)}
                                                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] bg-primary text-white shadow-md shadow-blue-500/20 hover:bg-primary-dark hover:shadow-lg hover:shadow-blue-500/30"
                                            >
                                                Start Practice
                                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}"""
content = re.sub(blocks_pattern, new_view_state_ui, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated QuestionSet.tsx")
