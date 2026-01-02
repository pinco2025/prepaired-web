import React from 'react';

const weakAreasData = [
  { name: 'Thermodynamics', tag: 'CRITICAL', progress: 20, attempted: '2/10', color: 'red' },
  { name: 'Integration', progress: 10, attempted: '1/10', color: 'orange' },
];

const colorMap: { [key: string]: { [key: string]: string } } = {
    red: {
      bg: 'bg-red-50 dark:bg-red-900/10',
      border: 'border-red-100 dark:border-red-800/20',
      tagBg: 'bg-red-100 dark:bg-red-800/40',
      tagText: 'text-red-600 dark:text-red-300',
      progressBg: 'bg-red-200 dark:bg-red-900/30',
      progressFill: 'bg-red-500',
      text: 'text-red-500',
    },
    orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/10',
        border: 'border-orange-100 dark:border-orange-800/20',
        tagBg: '', // Not used for orange
        tagText: 'text-orange-500',
        progressBg: 'bg-orange-200 dark:bg-orange-900/30',
        progressFill: 'bg-orange-500',
        text: 'text-orange-500',
    }
}

const WeakAreasCard: React.FC = () => {
  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">priority_high</span> Weak Areas
        </h2>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-4">
        <div className="text-center mb-2">
          <span className="text-3xl font-bold text-text-light dark:text-text-dark">3<span className="text-text-secondary-light dark:text-text-secondary-dark text-xl font-normal">/10</span></span>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Basic Chapters Cleared</p>
        </div>
        <div className="space-y-3">
          {weakAreasData.map((area, index) => {
            const colors = colorMap[area.color];
            return (
                <div key={index} className={`rounded-lg p-3 border ${colors.bg} ${colors.border}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-text-light dark:text-text-dark">{area.name}</span>
                  {area.tag && <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${colors.tagBg} ${colors.tagText}`}>{area.tag}</span>}
                  {!area.tag && <span className={`text-[10px] font-bold ${colors.tagText}`}>{area.attempted}</span>}
                </div>
                <div className={`w-full rounded-full h-1.5 ${colors.progressBg}`}>
                  <div className={`h-1.5 rounded-full ${colors.progressFill}`} style={{ width: `${area.progress}%` }}></div>
                </div>
                {area.tag && <p className={`text-[10px] text-right mt-1 ${colors.text}`}>{area.attempted} Attempted</p>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default WeakAreasCard;
