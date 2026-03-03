import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EXAM_DATES = [
  { value: 'jan-21', label: 'Jan 21, 2026' },
  { value: 'jan-22', label: 'Jan 22, 2026' },
  { value: 'jan-23', label: 'Jan 23, 2026' },
  { value: 'jan-24', label: 'Jan 24, 2026' },
  { value: 'jan-28', label: 'Jan 28, 2026' }
];

// ── Custom Dropdown Component ───────────────────────────────────────
interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  label: string;
  icon: string;
  placeholder: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ label, icon, placeholder, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find(o => o.value === value)?.label;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex-1" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`glow-input w-full h-12 rounded-xl border bg-surface-light dark:bg-surface-dark text-left px-4 pr-10 outline-none transition-all text-sm cursor-pointer flex items-center
            ${isOpen
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-border-light dark:border-border-dark hover:border-primary/40'
            }`}
        >
          <span className={selectedLabel ? 'text-text-light dark:text-text-dark font-medium' : 'text-text-secondary-light dark:text-text-secondary-dark'}>
            {selectedLabel || placeholder}
          </span>
        </button>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-secondary-light dark:text-text-secondary-dark">
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden animate-fade-in-up" style={{ animationDuration: '0.15s' }}>
            <div className="max-h-52 overflow-y-auto scrollbar-premium py-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={`w-full text-left px-4 py-3 md:py-2.5 text-sm transition-colors flex items-center justify-between
                    ${opt.value === value
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-light dark:text-text-dark hover:bg-primary/5 active:bg-primary/10 dark:hover:bg-primary/10'
                    }`}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && (
                    <span className="material-symbols-outlined text-primary text-base">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SHIFTS = [
  { value: 'shift-1', label: 'Shift 1 (9:00 AM)' },
  { value: 'shift-2', label: 'Shift 2 (3:00 PM)' },
];

const ResponseUpload: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [examDate, setExamDate] = useState('');
  const [shift, setShift] = useState('');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canSubmit = selectedFile && examDate && shift && tosAccepted && !isProcessing;

  const handleFile = useCallback((file: File) => {
    if (file.type !== 'application/pdf') return;
    if (file.size > 10 * 1024 * 1024) return;
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus('Uploading PDF…');
    setError(null);

    const dateLabel = EXAM_DATES.find(d => d.value === examDate)?.label || examDate;
    const shiftLabel = SHIFTS.find(s => s.value === shift)?.label || shift;

    try {
      // Step 1: Upload PDF to the parse endpoint
      setProcessingProgress(15);
      setProcessingStatus('Uploading to server…');

      const formData = new FormData();
      formData.append('file', selectedFile!);

      const API_URL = process.env.REACT_APP_PAYMENT_API_URL || 'https://razorpay-worker.achonam69.workers.dev';

      const response = await fetch(`${API_URL}/score`, {
        method: 'POST',
        body: formData,
      });

      setProcessingProgress(60);
      setProcessingStatus('Processing response…');

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errData.error || errData.details || `Server returned ${response.status}`);
      }

      const parsedData = await response.json();

      setProcessingProgress(85);
      setProcessingStatus('Preparing results…');
      await new Promise(r => setTimeout(r, 400));

      setProcessingProgress(100);
      setProcessingStatus('Done!');
      await new Promise(r => setTimeout(r, 300));

      navigate('/response-result', {
        state: { resultData: parsedData, examDate: dateLabel, shift: shiftLabel }
      });
    } catch (err: any) {
      console.error('PDF upload error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ── Processing Screen ──────────────────────────────────────────────
  if (isProcessing) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden relative h-full">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="flex-1 overflow-y-auto p-3 md:p-8 sidebar-scroll">
          <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh] gap-8 text-center">
            {/* Animated Icon */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-primary animate-pulse">smart_toy</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xs animate-spin">settings</span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2 tracking-tight">
                Analyzing Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Response</span>
              </h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                {processingStatus}
              </p>
            </div>

            {/* Progress */}
            <div className="w-full max-w-xs">
              <div className="w-full bg-border-light dark:bg-border-dark h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2 font-medium">{processingProgress}%</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Upload Screen ─────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden relative h-full">
      {/* Ambient background glow */}
      <div className="absolute top-20 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse opacity-70" />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl -z-10 animate-pulse opacity-50" style={{ animationDelay: '1.5s' }} />

      <div className="flex-1 overflow-y-auto p-3 md:p-8 sidebar-scroll">
        <div className="max-w-xl mx-auto h-full flex flex-col">

          {/* Page Header */}
          <div className="mb-8 md:mb-10">
            <h1 className="text-2xl md:text-4xl font-black text-text-light dark:text-text-dark tracking-tight">
              Response Sheet{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Analysis</span>
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2 text-sm md:text-base">
              Upload your official NTA response sheet to get an instant score breakdown.
            </p>
          </div>

          <div className="flex flex-col gap-6 pb-8">

            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-error-light/10 dark:bg-error-dark/10 border border-error-light/20 dark:border-error-dark/20">
                <span className="material-symbols-outlined text-error-light dark:text-error-dark text-lg shrink-0 mt-0.5">error</span>
                <div className="flex-1">
                  <p className="text-error-light dark:text-error-dark text-sm font-medium">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-error-light dark:text-error-dark hover:opacity-70 shrink-0">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            )}

            {/* ── Drop Zone ─────────────────────────────────────────── */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              className={`group bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card-light dark:shadow-card-dark border-2 border-dashed
                transition-all duration-300 cursor-pointer relative overflow-hidden
                ${isDragOver
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 scale-[1.01] shadow-lg shadow-primary/10'
                  : selectedFile
                    ? 'border-success-light/40 dark:border-success-dark/40 border-solid'
                    : 'border-border-light dark:border-border-dark hover:border-primary/40 hover:shadow-md'
                }`}
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {!selectedFile ? (
                <div className="flex flex-col items-center gap-4 py-10 md:py-14 px-4 md:px-6 relative z-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${isDragOver
                      ? 'bg-primary/10 text-primary scale-110'
                      : 'bg-gradient-to-br from-primary/10 to-accent/5 text-primary'
                    }`}>
                    <span className={`material-symbols-outlined text-3xl ${isDragOver ? 'animate-bounce' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                      cloud_upload
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-text-light dark:text-text-dark font-bold text-base">
                      {isDragOver ? 'Drop your PDF here' : 'Drop your response sheet here'}
                    </p>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
                      or <span className="text-primary font-semibold hidden md:inline">click to browse</span><span className="text-primary font-semibold md:hidden">tap to browse</span> • PDF, max 10 MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-5 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-light/10 to-success-light/5 dark:from-success-dark/10 dark:to-success-dark/5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl text-success-light dark:text-success-dark">description</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-light dark:text-text-dark font-semibold truncate">{selectedFile.name}</p>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                    className="p-2 rounded-lg hover:bg-error-light/10 dark:hover:bg-error-dark/10 text-text-secondary-light dark:text-text-secondary-dark hover:text-error-light dark:hover:text-error-dark transition-colors shrink-0"
                    title="Remove file"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />
            </div>

            {/* ── Date & Shift ──────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-4">
              <CustomDropdown
                label="Exam Date"
                icon="calendar_today"
                placeholder="Select date"
                options={EXAM_DATES}
                value={examDate}
                onChange={setExamDate}
              />
              <CustomDropdown
                label="Shift"
                icon="schedule"
                placeholder="Select shift"
                options={SHIFTS}
                value={shift}
                onChange={setShift}
              />
            </div>

            {/* ── Terms + CTA ──────────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={tosAccepted}
                    onChange={(e) => setTosAccepted(e.target.checked)}
                    className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded border border-border-light dark:border-border-dark transition-all checked:border-primary checked:bg-primary hover:border-primary"
                  />
                  <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </span>
                </div>
                <span className="text-text-secondary-light dark:text-text-secondary-dark text-xs sm:text-sm active:text-text-light group-hover:text-text-light dark:group-hover:text-text-dark transition-colors">
                  I agree to the <span className="text-primary font-semibold">Terms of Service</span> & allow processing
                </span>
              </label>

              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className={`glow-button w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 tracking-wide uppercase
                  ${canSubmit
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-[0.98]'
                    : 'bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed shadow-none'
                  }`}
              >
                <span>Analyze Response Sheet</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>

              <p className="text-center text-xs text-text-secondary-light dark:text-text-secondary-dark flex items-center justify-center gap-1.5 opacity-60">
                <span className="material-symbols-outlined text-xs">lock</span>
                Secure & encrypted processing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseUpload;
