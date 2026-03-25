import React from 'react';

export const NTAModeDialog: React.FC<{
    onSelectNTA: () => void;
    onSelectStandard: () => void;
}> = ({ onSelectNTA, onSelectStandard }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="relative bg-surface-light dark:bg-surface-dark rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4 shadow-2xl border border-border-light dark:border-border-dark">
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">computer</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-text-light dark:text-text-dark mb-1">Attempt in NTA Mode?</h2>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                        NTA mode replicates the official JEE exam portal interface — same layout, same buttons, same experience.
                    </p>
                </div>
                <div className="w-full flex flex-col gap-2 mt-1">
                    <button
                        onClick={onSelectNTA}
                        className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                        Yes, Open in NTA Mode
                    </button>
                    <button
                        onClick={onSelectStandard}
                        className="w-full py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
                    >
                        Continue in Standard Mode
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export const NTABackWarningDialog: React.FC<{
    onStay: () => void;
    onLeave: () => void;
}> = ({ onStay, onLeave }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="relative bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-200">
            <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-800 mb-1">Leave the test?</h2>
                    <p className="text-sm text-slate-600">Your saved progress might get lost if you navigate away from the test.</p>
                </div>
                <div className="w-full flex gap-2 mt-1">
                    <button
                        onClick={onStay}
                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700"
                    >
                        Stay on Test
                    </button>
                    <button
                        onClick={onLeave}
                        className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-50"
                    >
                        Leave
                    </button>
                </div>
            </div>
        </div>
    </div>
);
