import re

file_path = "c:/Users/Harshit Sayal/Desktop/BDP/prepAIred/prepaired-dev/prepaired-web/client/src/components/QuestionSet.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

start_str = "                    {/* Statement Parts Selection View */}"
end_str = "                </div>\n            </div>\n\n            {showPaywallModal && ("

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
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
                    )}
"""
    new_content = content[:start_idx] + new_view_state_ui + content[end_idx:]
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Fixed view state ui mapping")
else:
    print(f"Failed: start_idx={start_idx}, end_idx={end_idx}")
