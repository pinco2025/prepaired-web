import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import condensedImg from '../assets/cards/condensed-pyq.png';
import assertionImg from '../assets/cards/assertion.png';
import fastTrackImg from '../assets/cards/fast-track-set.png';
import degree360Img from '../assets/cards/360-degree-set.png';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShiftRow {
  percentile: number;
  overall: number | null;
  math: number | null;
  physics: number | null;
  chemistry: number | null;
}

interface SubjectRow {
  percentile: number;
  [shift: string]: number | null;
}

interface JEEData {
  shifts: string[];
  overall: SubjectRow[];
  physics: SubjectRow[];
  chemistry: SubjectRow[];
  math: SubjectRow[];
  per_shift: Record<string, ShiftRow[]>;
}

interface Computed {
  currentOverall: number | null;
  currentPhysics: number | null;
  currentChem: number | null;
  currentMath: number | null;
  safe: Record<string, number>;
  guaranteed: Record<string, number>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SHIFTS = [
  { label: 'Jan 21', sub: 'S1', key: '21S1' },
  { label: 'Jan 21', sub: 'S2', key: '21S2' },
  { label: 'Jan 22', sub: 'S1', key: '22S1' },
  { label: 'Jan 22', sub: 'S2', key: '22S2' },
  { label: 'Jan 23', sub: 'S1', key: '23S1' },
  { label: 'Jan 23', sub: 'S2', key: '23S2' },
  { label: 'Jan 24', sub: 'S1', key: '24S1' },
  { label: 'Jan 24', sub: 'S2', key: '24S2' },
  { label: 'Jan 28', sub: 'S1', key: '28S1' },
  { label: 'Jan 28', sub: 'S2', key: '28S2' },
];

const STATS = {
  overall:   { mean: 162, sd: 4.62 },
  physics:   { mean: 71,  sd: 2.06 },
  chemistry: { mean: 63,  sd: 4.71 },
  math:      { mean: 44,  sd: 4.55 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function interpolate(rows: SubjectRow[], key: string, percentile: number): number | null {
  if (!rows.length) return null;
  if (percentile >= rows[0].percentile) return rows[0][key] as number | null;
  if (percentile <= rows[rows.length - 1].percentile) return rows[rows.length - 1][key] as number | null;
  for (let i = 0; i < rows.length - 1; i++) {
    const hi = rows[i], lo = rows[i + 1];
    if (percentile <= hi.percentile && percentile >= lo.percentile) {
      const hiV = hi[key] as number | null;
      const loV = lo[key] as number | null;
      if (hiV == null || loV == null) return null;
      const t = (hi.percentile - percentile) / (hi.percentile - lo.percentile);
      return Math.round(hiV + t * (loV - hiV));
    }
  }
  return null;
}

function interpolateShift(rows: ShiftRow[], key: keyof ShiftRow, percentile: number): number | null {
  if (!rows.length) return null;
  if (percentile >= rows[0].percentile) return rows[0][key] as number | null;
  if (percentile <= rows[rows.length - 1].percentile) return rows[rows.length - 1][key] as number | null;
  for (let i = 0; i < rows.length - 1; i++) {
    const hi = rows[i], lo = rows[i + 1];
    if (percentile <= hi.percentile && percentile >= lo.percentile) {
      const hiV = hi[key] as number | null;
      const loV = lo[key] as number | null;
      if (hiV == null || loV == null) return null;
      const t = (hi.percentile - percentile) / (hi.percentile - lo.percentile);
      return Math.round((hiV as number) + t * ((loV as number) - (hiV as number)));
    }
  }
  return null;
}

function calcTargets(k: number): Record<string, number> {
  return Object.fromEntries(
    Object.entries(STATS).map(([s, v]) => [s, Math.round(v.mean + k * v.sd)])
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = ['January Data', 'Subject Percentiles', 'Analysis', 'Results', 'April Plan'];

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="flex items-center gap-1 mb-8">
    {STEP_LABELS.map((label, i) => {
      const step = i + 1;
      const done = step < current;
      const active = step === current;
      return (
        <React.Fragment key={step}>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0
              ${done ? 'bg-primary text-white' : active ? 'bg-primary text-white' : 'bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark'}`}>
              {done
                ? <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                : step}
            </div>
            <span className={`text-xs font-medium whitespace-nowrap transition-colors hidden sm:block
              ${active ? 'text-text-light dark:text-text-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`flex-1 h-px min-w-3 transition-colors ${done ? 'bg-primary' : 'bg-border-light dark:bg-border-dark'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── Roadmap Items ────────────────────────────────────────────────────────────

const JEE_APRIL_DATE = new Date('2026-04-02T00:00:00');

interface RoadmapItem {
  key: string;
  title: string;
  badge: string;
  desc: string;
  img?: string;
  gradient?: string;
  tag: string;
  tagColor: string;
  navigateTo: string;
  navigateState?: object;
  minDays: number;
}

const ALL_ROADMAP_ITEMS: RoadmapItem[] = [
  {
    key: 'condensed',
    title: 'Condensed PYQ Set',
    badge: 'Start Here',
    desc: 'The smartest way to cover maximum PYQ ground — handpicked, high-yield questions from every chapter.',
    img: condensedImg,
    tag: 'PYQ · High Yield',
    tagColor: 'text-primary bg-primary/10',
    navigateTo: '/question-set',
    navigateState: { viewState: 'subject_selection', selectedSet: 'condensed_main' },
    minDays: 5,
  },
  {
    key: 'anr',
    title: 'A&R Set',
    badge: 'Trap Killer',
    desc: 'Assertion & Reasoning questions are the easiest marks to lose. Master the pattern before others even notice.',
    img: assertionImg,
    tag: 'A&R · Statement Based',
    tagColor: 'text-accent bg-accent/10',
    navigateTo: '/question-set',
    navigateState: { viewState: 'subject_selection', selectedSet: 'statement' },
    minDays: 4,
  },
  {
    key: 'aipt03',
    title: 'AIPT-03',
    badge: 'Free Mock',
    desc: 'Simulate JEE Main under real exam pressure. Your score here predicts April better than anything else.',
    gradient: 'from-violet-600/20 via-primary/10 to-transparent',
    tag: 'Full Mock · NTA Pattern',
    tagColor: 'text-neon-purple bg-neon-purple/10',
    navigateTo: '/aipt',
    minDays: 3,
  },
  {
    key: 'fasttrack',
    title: 'Fast Track Set',
    badge: 'Score Fast',
    desc: 'Maximum marks in minimum time. Designed for the final stretch — every question is worth your last hours.',
    img: fastTrackImg,
    tag: 'Speed · Efficiency',
    tagColor: 'text-success-light dark:text-success-dark bg-success-light/10 dark:bg-success-dark/10',
    navigateTo: '/question-set',
    navigateState: { viewState: 'subject_selection', selectedSet: 'accuracy' },
    minDays: 2,
  },
  {
    key: '360',
    title: '360° Set',
    badge: 'Last Resort',
    desc: 'The most analysed, best full-coverage set. If you attempt one thing before April, make it this.',
    img: degree360Img,
    tag: 'Full Coverage · Multi-concept',
    tagColor: 'text-orange-400 bg-orange-400/10',
    navigateTo: '/question-set',
    navigateState: { viewState: 'subject_selection', selectedSet: 'level2' },
    minDays: 1,
  },
];

const JEEPredictor: React.FC = () => {
  const navigate = useNavigate();
  const { subscriptionType, user, isAuthenticated } = useAuth();
  const [jeeData, setJeeData] = useState<JEEData | null>(null);
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);

  // Step 1
  const [shift, setShift] = useState<string | null>(null);
  const [overallPct, setOverallPct] = useState('');
  const [s1Errors, setS1Errors] = useState<{ shift?: boolean; percentile?: boolean }>({});

  // Step 2
  const [phyPct, setPhyPct]   = useState('');
  const [chemPct, setChemPct] = useState('');
  const [mathPct, setMathPct] = useState('');
  const [phyMarks, setPhyMarks]   = useState('');
  const [chemMarks, setChemMarks] = useState('');
  const [mathMarks, setMathMarks] = useState('');
  const [s2Error, setS2Error] = useState(false);

  // Step 3 (procedural)
  const [visibleCards, setVisibleCards] = useState(0);
  const [computed, setComputed] = useState<Computed | null>(null);
  const procTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/jee_jan_data.json')
      .then(r => r.json())
      .then(setJeeData)
      .catch(console.error);
  }, []);

  // ── Load saved data on mount ─────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated || !user) { setDbLoading(false); return; }
    setDbLoading(true);
    (async () => {
      let hadDbData = false;
      try {
        const { data } = await supabase
          .from('jee_predictor_responses')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          hadDbData = true;
          setShift(data.shift);
          setOverallPct(String(data.overall_pct));
          setPhyPct(String(data.phy_pct));
          setChemPct(String(data.chem_pct));
          setMathPct(String(data.math_pct));
          if (data.phy_marks != null)  setPhyMarks(String(data.phy_marks));
          if (data.chem_marks != null) setChemMarks(String(data.chem_marks));
          if (data.math_marks != null) setMathMarks(String(data.math_marks));
          setComputed({
            currentOverall:  data.current_overall,
            currentPhysics:  data.current_physics,
            currentChem:     data.current_chem,
            currentMath:     data.current_math,
            safe:      { overall: data.safe_overall,      physics: data.safe_physics,      chemistry: data.safe_chemistry,      math: data.safe_math },
            guaranteed:{ overall: data.guaranteed_overall, physics: data.guaranteed_physics, chemistry: data.guaranteed_chemistry, math: data.guaranteed_math },
          });
          setMaxStep(4);
          setStep(4);
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      } catch {
        // fall through
      } finally {
        // Restore step 1 inputs saved before login redirect (Google OAuth path)
        if (!hadDbData) {
          try {
            const saved = sessionStorage.getItem('jee_predictor_step1');
            if (saved) {
              const { shift: s, overallPct: p } = JSON.parse(saved);
              if (s) setShift(s);
              if (p) setOverallPct(p);
            }
          } catch {}
          sessionStorage.removeItem('jee_predictor_step1');
        }
        setDbLoading(false);
      }
    })();
  }, [isAuthenticated, user]);

  // ── After inline login: auto-advance to step 2 if step 1 data is ready ──────

  const justLoggedInRef = useRef(false);
  // Keep live refs so the effect below doesn't need them as deps
  const stepRef = useRef(step);
  const shiftRef = useRef(shift);
  const overallPctRef = useRef(overallPct);
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { shiftRef.current = shift; }, [shift]);
  useEffect(() => { overallPctRef.current = overallPct; }, [overallPct]);

  useEffect(() => {
    if (isAuthenticated && !dbLoading && stepRef.current === 1 && shiftRef.current && overallPctRef.current) {
      if (justLoggedInRef.current) {
        justLoggedInRef.current = false;
        setMaxStep(m => Math.max(m, 2));
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [isAuthenticated, dbLoading]);

  // Track when auth transitions from false → true
  const prevAuthRef = useRef(isAuthenticated);
  useEffect(() => {
    if (!prevAuthRef.current && isAuthenticated) {
      justLoggedInRef.current = true;
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // ── Save data to Supabase ────────────────────────────────────────────────────

  const saveToDb = (c: Computed) => {
    if (!isAuthenticated || !user) return;
    supabase.from('jee_predictor_responses').upsert({
      user_id:    user.id,
      shift,
      overall_pct:  parseFloat(overallPct),
      phy_pct:      parseFloat(phyPct),
      chem_pct:     parseFloat(chemPct),
      math_pct:     parseFloat(mathPct),
      phy_marks:    phyMarks  ? parseFloat(phyMarks)  : null,
      chem_marks:   chemMarks ? parseFloat(chemMarks) : null,
      math_marks:   mathMarks ? parseFloat(mathMarks) : null,
      current_overall:  c.currentOverall,
      current_physics:  c.currentPhysics,
      current_chem:     c.currentChem,
      current_math:     c.currentMath,
      safe_overall:      c.safe.overall,
      safe_physics:      c.safe.physics,
      safe_chemistry:    c.safe.chemistry,
      safe_math:         c.safe.math,
      guaranteed_overall:  c.guaranteed.overall,
      guaranteed_physics:  c.guaranteed.physics,
      guaranteed_chemistry:c.guaranteed.chemistry,
      guaranteed_math:     c.guaranteed.math,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' }).then(() => {});
  };

  // ── Navigation ──────────────────────────────────────────────────────────────

  const goTo = (n: number) => {
    if (n > maxStep) return;
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Step 1 ──────────────────────────────────────────────────────────────────

  const handleStep1Next = () => {
    const p = parseFloat(overallPct);
    const errors: typeof s1Errors = {};
    if (!shift) errors.shift = true;
    if (isNaN(p) || p < 0 || p > 100) errors.percentile = true;
    if (Object.keys(errors).length) { setS1Errors(errors); return; }
    setS1Errors({});
    if (!isAuthenticated) {
      // Persist inputs so they survive an OAuth redirect
      sessionStorage.setItem('jee_predictor_step1', JSON.stringify({ shift, overallPct }));
      setShowLoginGate(true);
      return;
    }
    const next = Math.max(maxStep, 2);
    setMaxStep(next);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Step 2 ──────────────────────────────────────────────────────────────────

  const handleStep2Next = () => {
    const pp = parseFloat(phyPct);
    const cp = parseFloat(chemPct);
    const mp = parseFloat(mathPct);
    if (isNaN(pp) || isNaN(cp) || isNaN(mp)) { setS2Error(true); return; }
    setS2Error(false);
    runCompute(pp, cp, mp);
    const next = Math.max(maxStep, 3);
    setMaxStep(next);
    setStep(3);
    setVisibleCards(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Stagger cards
    if (procTimer.current) clearTimeout(procTimer.current);
    let count = 0;
    const tick = () => {
      count++;
      setVisibleCards(count);
      if (count < 3) procTimer.current = setTimeout(tick, 700);
      else setMaxStep(m => Math.max(m, 4));
    };
    procTimer.current = setTimeout(tick, 400);
  };

  // ── Computation ─────────────────────────────────────────────────────────────

  const runCompute = (pp: number, cp: number, mp: number) => {
    if (!jeeData || !shift) return;
    const p = parseFloat(overallPct);

    const currentOverall  = interpolateShift(jeeData.per_shift[shift], 'overall', p);
    const currentPhysics  = phyMarks  ? parseFloat(phyMarks)  : interpolate(jeeData.physics,   shift, pp);
    const currentChem     = chemMarks ? parseFloat(chemMarks) : interpolate(jeeData.chemistry,  shift, cp);
    const currentMath     = mathMarks ? parseFloat(mathMarks) : interpolate(jeeData.math,       shift, mp);

    const c: Computed = {
      currentOverall,
      currentPhysics,
      currentChem,
      currentMath,
      safe:      calcTargets(1.3),
      guaranteed: calcTargets(2.0),
    };
    setComputed(c);
    saveToDb(c);
  };

  const resetAll = () => {
    setStep(1); setMaxStep(1);
    setShift(null); setOverallPct('');
    setPhyPct(''); setChemPct(''); setMathPct('');
    setPhyMarks(''); setChemMarks(''); setMathMarks('');
    setComputed(null); setVisibleCards(0);
    // Clear saved data for this user
    if (isAuthenticated && user) {
      supabase.from('jee_predictor_responses').delete().eq('user_id', user.id).then(() => {});
    }
  };

  // ─── Render Step 1 ──────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-grotesk text-text-light dark:text-text-dark">January Attempt</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">Select your shift and enter your overall NTA percentile.</p>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-4 sm:p-6 md:p-8 space-y-7">
        {/* Shift */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-3">
            Select Your Shift
          </label>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {SHIFTS.map(s => (
              <button
                key={s.key}
                onClick={() => { setShift(s.key); setS1Errors(e => ({ ...e, shift: false })); }}
                className={`py-3 px-1 text-center rounded-xl border transition-all duration-200
                  ${shift === s.key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-light dark:border-border-dark hover:border-primary/50 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark'}`}
              >
                <span className="block text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-medium">{s.label}</span>
                <span className="block text-sm font-bold font-grotesk">{s.sub}</span>
              </button>
            ))}
          </div>
          {s1Errors.shift && <p className="text-error-light dark:text-error-dark text-xs mt-2">Please select your exam shift.</p>}
        </div>

        {/* Overall Percentile */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-3">
            Overall NTA Percentile
          </label>
          <div className="relative">
            <input
              type="text" inputMode="decimal"
              value={overallPct}
              onChange={e => { setOverallPct(e.target.value); setS1Errors(er => ({ ...er, percentile: false })); }}
              placeholder="00.00"
              className={`w-full bg-background-light dark:bg-background-dark border rounded-xl py-4 sm:py-5 px-4 sm:px-6 text-4xl sm:text-5xl font-bold font-grotesk text-primary tabular-nums text-center focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all
                ${s1Errors.percentile ? 'border-error-light dark:border-error-dark' : 'border-border-light dark:border-border-dark'}`}
            />
          </div>
          {s1Errors.percentile && <p className="text-error-light dark:text-error-dark text-xs mt-2">Enter a valid percentile (0–100).</p>}
        </div>

        <div className="flex justify-end pt-2 border-t border-border-light dark:border-border-dark">
          <button
            onClick={handleStep1Next}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-xl transition-all active:scale-95"
          >
            Next <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Render Step 2 ──────────────────────────────────────────────────────────

  const subjectRows = [
    { label: 'Physics',     icon: 'bolt',      pct: phyPct,  marks: phyMarks,  setPct: setPhyPct,  setMarks: setPhyMarks,  color: 'text-primary' },
    { label: 'Chemistry',   icon: 'science',   pct: chemPct, marks: chemMarks, setPct: setChemPct, setMarks: setChemMarks, color: 'text-accent' },
    { label: 'Mathematics', icon: 'functions', pct: mathPct, marks: mathMarks, setPct: setMathPct, setMarks: setMathMarks, color: 'text-neon-purple' },
  ];

  const renderStep2 = () => (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-grotesk text-text-light dark:text-text-dark">Subject Percentiles</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">Enter your percentile for each subject. Marks are optional but improve accuracy.</p>
      </div>

      <div className="space-y-3">
        {subjectRows.map(s => (
          <div
            key={s.label}
            className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-4 md:w-44 shrink-0">
              <div className={`w-11 h-11 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined text-2xl">{s.icon}</span>
              </div>
              <span className="font-bold text-text-light dark:text-text-dark font-grotesk">{s.label}</span>
            </div>

            <div className="flex flex-1 items-end gap-4">
              <div className="flex-1">
                <label className="block text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-bold uppercase tracking-widest mb-2">Percentile</label>
                <div className="relative">
                  <input
                    type="text" inputMode="decimal"
                    value={s.pct}
                    onChange={e => { s.setPct(e.target.value); setS2Error(false); }}
                    placeholder="99.00"
                    className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-2xl font-bold font-grotesk text-primary tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark font-bold text-sm">%</span>
                </div>
              </div>

              <div className="w-28 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-bold uppercase tracking-widest">Marks</label>
                  <span className="text-[9px] bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">optional</span>
                </div>
                <input
                  type="text" inputMode="numeric"
                  value={s.marks}
                  onChange={e => s.setMarks(e.target.value)}
                  placeholder="--"
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-xl font-bold font-grotesk text-center tabular-nums text-text-secondary-light dark:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {s2Error && <p className="text-error-light dark:text-error-dark text-xs mt-3">Please enter percentiles for all three subjects.</p>}

      <div className="flex justify-between items-center mt-6">
        <button onClick={() => goTo(1)} className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors font-medium text-sm">
          <span className="material-symbols-outlined text-xl">arrow_back</span> Back
        </button>
        <button
          onClick={handleStep2Next}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-xl transition-all active:scale-95"
        >
          Analyse <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>
      </div>
    </div>
  );

  // ─── Render Step 3 ──────────────────────────────────────────────────────────

  const renderStep3 = () => {
    if (!computed || !shift) return null;

    const shift99marks = jeeData?.per_shift?.[shift]?.find(r => r.percentile === 99.0)?.overall ?? 162;
    const factor = (shift99marks / 162).toFixed(2);

    const abilityRows = [
      { name: 'Physics',     current: computed.currentPhysics, safe: computed.safe.physics,    color: 'bg-primary' },
      { name: 'Chemistry',   current: computed.currentChem,    safe: computed.safe.chemistry,  color: 'bg-accent' },
      { name: 'Mathematics', current: computed.currentMath,    safe: computed.safe.math,        color: 'bg-neon-purple' },
    ];

    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-grotesk text-text-light dark:text-text-dark">Analysing Performance</h1>
        </div>

        <div className="space-y-4">
          {/* Card 1: Shift Normalisation */}
          <div className={`bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 transition-all duration-500 ${visibleCards >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-base">tune</span>
              </div>
              <h3 className="font-bold font-grotesk text-text-light dark:text-text-dark">Shift Difficulty</h3>
              {visibleCards >= 1 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Your Shift', value: shift },
                { label: '99th %ile in your shift', value: `${shift99marks} marks` },
                { label: 'Avg 99th %ile (all shifts)', value: '162 marks' },
                { label: 'vs average', value: parseFloat(factor) > 1 ? 'Harder than avg' : parseFloat(factor) < 1 ? 'Easier than avg' : 'On par', highlight: parseFloat(factor) > 1 },
              ].map(item => (
                <div key={item.label} className="bg-background-light dark:bg-background-dark rounded-xl p-3 border border-border-light dark:border-border-dark">
                  <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-bold uppercase tracking-widest mb-1">{item.label}</p>
                  <p className={`font-bold font-grotesk tabular-nums ${item.highlight ? 'text-error-light dark:text-error-dark' : 'text-text-light dark:text-text-dark'}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Ability Mapping */}
          <div className={`bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 transition-all duration-500 ${visibleCards >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <span className="material-symbols-outlined text-base">bar_chart</span>
              </div>
              <h3 className="font-bold font-grotesk text-text-light dark:text-text-dark">Your Scores vs Target</h3>
              {visibleCards >= 2 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </span>
              )}
            </div>
            <div className="space-y-5">
              {abilityRows.map(row => {
                const barW = row.current != null ? Math.min(100, Math.round((row.current / 100) * 100)) : 0;
                const targetW = Math.min(100, Math.round((row.safe / 100) * 100));
                const gap = row.current != null ? row.safe - row.current : null;
                return (
                  <div key={row.name}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-text-light dark:text-text-dark">{row.name}</span>
                      <span className={`text-xs font-bold tabular-nums ${gap != null && gap <= 0 ? 'text-success-light dark:text-success-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
                        {gap != null ? (gap > 0 ? `+${gap} marks to target` : '✓ At target') : 'N/A'}
                      </span>
                    </div>
                    <div className="relative h-2 w-full bg-border-light dark:bg-border-dark rounded-full overflow-visible">
                      <div className={`h-full ${row.color} rounded-full transition-all duration-700`} style={{ width: `${barW}%` }} />
                      <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded" style={{ left: `${targetW}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark tabular-nums">{row.current ?? 'N/A'} / 100</span>
                      <span className="text-[10px] text-primary tabular-nums">Target: {row.safe}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Historical Distribution */}
          <div className={`bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 transition-all duration-500 ${visibleCards >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-neon-purple/10 flex items-center justify-center text-neon-purple shrink-0">
                <span className="material-symbols-outlined text-base">query_stats</span>
              </div>
              <h3 className="font-bold font-grotesk text-text-light dark:text-text-dark">Past Exam Trends</h3>
              {visibleCards >= 3 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Shifts Analysed', value: '10' },
                { label: 'Overall cutoff swings by', value: '±5 marks' },
                { label: '99th %ile range', value: '155–171' },
                { label: 'Math swings the most', value: '±5 marks' },
              ].map(item => (
                <div key={item.label} className="bg-background-light dark:bg-background-dark rounded-xl p-3 border border-border-light dark:border-border-dark">
                  <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-bold uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="font-bold font-grotesk text-xl tabular-nums text-text-light dark:text-text-dark">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button onClick={() => goTo(2)} className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors font-medium text-sm">
            <span className="material-symbols-outlined text-xl">arrow_back</span> Back
          </button>
          <button
            onClick={() => goTo(4)}
            disabled={maxStep < 4}
            className={`flex items-center gap-2 font-bold px-8 py-3 rounded-xl transition-all active:scale-95
              ${maxStep >= 4 ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed'}`}
          >
            View Results <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  };

  // ─── Render Step 4 ──────────────────────────────────────────────────────────

  const renderStep4 = () => {
    if (!computed) return null;
    const { currentOverall, currentPhysics, currentChem, currentMath, safe, guaranteed } = computed;

    const subjects = [
      { name: 'Physics',     icon: 'bolt',      current: currentPhysics, safe: safe.physics,    guaranteed: guaranteed.physics,    color: 'text-primary',     sd: 2.06 },
      { name: 'Chemistry',   icon: 'science',   current: currentChem,    safe: safe.chemistry,  guaranteed: guaranteed.chemistry,  color: 'text-accent',      sd: 4.71 },
      { name: 'Mathematics', icon: 'functions', current: currentMath,    safe: safe.math,       guaranteed: guaranteed.math,       color: 'text-neon-purple', sd: 4.55 },
    ];

    const gapsRanked = subjects
      .filter(s => s.current != null)
      .map(s => ({ ...s, gap: (s.safe - (s.current ?? 0)) }))
      .sort((a, b) => (b.gap / b.sd) - (a.gap / a.sd));

    const priority = gapsRanked.find(s => s.gap > 0) ?? null;
    const overallGap = currentOverall != null ? safe.overall - currentOverall : null;

    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-grotesk text-text-light dark:text-text-dark">April Target</h1>
            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors text-xs font-medium mt-0.5"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Recalculate
            </button>
          </div>
          <button
            onClick={() => { setMaxStep(m => Math.max(m, 5)); setStep(5); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-1.5 bg-error-light/10 dark:bg-error-dark/10 hover:bg-error-light/20 dark:hover:bg-error-dark/20 text-error-light dark:text-error-dark border border-error-light/30 dark:border-error-dark/30 px-3 py-2 rounded-xl transition-all text-sm font-bold active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>crisis_alert</span>
            <span className="hidden xs:inline">Work on Weakness</span>
            <span className="xs:hidden">Weakness</span>
          </button>
        </div>

        {/* ── 1. Subject breakdown ── */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-3">Subject Breakdown</p>
        <div className="space-y-3 mb-5">
          {subjects.map(s => {
            const gap = s.current != null ? s.safe - s.current : null;
            const barW = s.current != null ? Math.min(100, Math.round((s.current / 100) * 100)) : 0;
            const targetW = Math.min(100, Math.round((s.safe / 100) * 100));
            const onTarget = gap != null && gap <= 0;
            return (
              <div key={s.name} className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark flex items-center justify-center shrink-0 ${s.color}`}>
                      <span className="material-symbols-outlined text-lg">{s.icon}</span>
                    </div>
                    <span className="font-bold font-grotesk text-text-light dark:text-text-dark">{s.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shrink-0
                    ${onTarget ? 'bg-success-light/10 dark:bg-success-dark/10 text-success-light dark:text-success-dark' : 'bg-error-light/10 dark:bg-error-dark/10 text-error-light dark:text-error-dark'}`}>
                    {gap != null ? (gap > 0 ? `+${gap} needed` : '✓ On target') : 'N/A'}
                  </span>
                </div>
                <div className="flex items-end justify-between mb-2.5">
                  <div>
                    <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-bold uppercase tracking-tighter mb-0.5">Jan Score</p>
                    <p className="text-2xl font-bold font-grotesk tabular-nums text-text-light dark:text-text-dark">{s.current ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary-dark text-lg">→</div>
                  <div className="text-right">
                    <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-bold uppercase tracking-tighter mb-0.5">April Target</p>
                    <p className="text-2xl font-bold font-grotesk tabular-nums text-primary">{s.safe} <span className="text-sm font-normal text-text-secondary-light dark:text-text-secondary-dark">– {s.guaranteed}</span></p>
                  </div>
                </div>
                <div className="relative h-2 w-full bg-border-light dark:bg-border-dark rounded-full overflow-visible">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${barW}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary/40 rounded" style={{ left: `${targetW}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 2. Priority strip ── */}
        {priority && (
          <div className="mb-5 bg-error-light/5 dark:bg-error-dark/5 border-l-4 border-error-light dark:border-error-dark rounded-r-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-error-light dark:text-error-dark shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <p className="text-sm text-text-light dark:text-text-dark leading-relaxed">
              Biggest gap: <span className="font-bold text-error-light dark:text-error-dark">{priority.name}</span>
              <span className="text-text-secondary-light dark:text-text-secondary-dark"> — {priority.gap} marks behind target. This is what's costing you rank right now.</span>
            </p>
          </div>
        )}

        {/* ── 3. Overall target hero ── */}
        <div className="rounded-2xl overflow-hidden border border-primary/30 bg-primary/5 dark:bg-primary/10 mb-6">
          <div className="bg-primary px-5 py-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
            <span className="text-white font-bold text-sm uppercase tracking-widest">Overall Score to hit 99th percentile</span>
          </div>
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-2">Safe Target</p>
                <p className="text-5xl sm:text-6xl font-bold font-grotesk tabular-nums text-primary leading-none">{safe.overall}</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">/ 300</p>
                <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-2">Beats 9 of 10 shifts</p>
              </div>
              <div className="text-center border-l border-primary/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-2">Guaranteed</p>
                <p className="text-5xl sm:text-6xl font-bold font-grotesk tabular-nums text-text-light dark:text-text-dark leading-none">{guaranteed.overall}</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">/ 300</p>
                <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-2">Beats all shifts</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-primary/15">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Jan score:</span>
                <span className="font-bold font-grotesk tabular-nums text-text-light dark:text-text-dark">{currentOverall ?? 'N/A'}</span>
              </div>
              {overallGap != null && (
                <span className={`font-bold font-grotesk tabular-nums text-sm px-3 py-1 rounded-xl
                  ${overallGap <= 0 ? 'bg-success-light/10 dark:bg-success-dark/10 text-success-light dark:text-success-dark' : 'bg-primary/10 text-primary'}`}>
                  {overallGap > 0 ? `+${overallGap} marks to safe target` : '✓ Already at target'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. Work on Weakness CTA ── */}
        <button
          onClick={() => { setMaxStep(m => Math.max(m, 5)); setStep(5); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="w-full group relative overflow-hidden rounded-2xl border border-error-light/30 dark:border-error-dark/30 bg-error-light/5 dark:bg-error-dark/5 hover:bg-error-light/10 dark:hover:bg-error-dark/10 transition-all duration-300 active:scale-[0.99] p-5 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-error-light/15 dark:bg-error-dark/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error-light dark:text-error-dark text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>crisis_alert</span>
              </div>
              <div>
                <p className="font-bold font-grotesk text-text-light dark:text-text-dark text-base leading-tight">Work on Your Weakness</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Your personalised April prep plan — {Math.max(0, Math.ceil((JEE_APRIL_DATE.getTime() - (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })()) / (1000 * 60 * 60 * 24)))} days left</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-error-light dark:text-error-dark group-hover:translate-x-1 transition-transform text-2xl shrink-0">arrow_forward</span>
          </div>
        </button>
      </div>
    );
  };

  // ─── Render Step 5 ──────────────────────────────────────────────────────────

  const renderStep5 = () => {
    if (!computed) return null;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const daysLeft = Math.max(0, Math.ceil((JEE_APRIL_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const startIdx = Math.max(0, ALL_ROADMAP_ITEMS.length - daysLeft);
    const roadmapItems = daysLeft > 0 ? ALL_ROADMAP_ITEMS.slice(startIdx) : [];

    const isLiteUser = subscriptionType === 'lite' || subscriptionType === 'admin';

    const handleRoadmapClick = (item: RoadmapItem) => {
      if (isLiteUser) {
        navigate(item.navigateTo, item.navigateState ? { state: item.navigateState } : undefined);
      } else {
        setShowUpgradePopup(true);
      }
    };

    if (daysLeft === 0) {
      return (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-5xl text-primary mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          <h2 className="text-xl font-bold font-grotesk text-text-light dark:text-text-dark mb-2">JEE April has begun</h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Go give it everything. You've got this.</p>
        </div>
      );
    }

    return (
      <div>
        {/* Header */}
        <div className="mb-6">
          {/* Countdown chip */}
          <div className="inline-flex items-center gap-1.5 bg-error-light/10 dark:bg-error-dark/10 border border-error-light/25 dark:border-error-dark/25 rounded-full px-3 py-1 mb-3">
            <span className="material-symbols-outlined text-error-light dark:text-error-dark text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
            <span className="text-xs font-bold text-error-light dark:text-error-dark tabular-nums">{daysLeft} day{daysLeft !== 1 ? 's' : ''} to JEE April</span>
          </div>
          <h1 className="text-2xl font-bold font-grotesk text-text-light dark:text-text-dark leading-tight">
            {daysLeft >= 5 ? "Your April Gameplan" : daysLeft >= 3 ? "Last Window. Make it count." : "Final Push. No shortcuts."}
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1.5 leading-relaxed">
            {daysLeft >= 5
              ? "Every topper who jumped rank in April followed this sequence. Attempt them in order."
              : daysLeft >= 3
              ? "Time is tight — these are the highest-ROI resources left. Skip one and you'll feel it on results day."
              : "This is it. One last push. Every hour you put in now is a rank you claim on results day."}
          </p>
        </div>

        {/* Sequence indicator */}
        {roadmapItems.length > 1 && (
          <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 scrollbar-none">
            {roadmapItems.map((item, idx) => (
              <React.Fragment key={item.key}>
                <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                  ${idx === 0
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark border-border-light dark:border-border-dark'}`}>
                  <span className="tabular-nums">{idx + 1}</span>
                  <span className="hidden xs:inline">{item.title.split(' ')[0]}</span>
                </div>
                {idx < roadmapItems.length - 1 && (
                  <span className="material-symbols-outlined text-border-light dark:text-border-dark text-sm shrink-0">chevron_right</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Cards */}
        <div className="space-y-4">
          {roadmapItems.map((item, idx) => (
            <button
              key={item.key}
              onClick={() => handleRoadmapClick(item)}
              className="w-full text-left group bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 active:scale-[0.985]"
            >
              {/* ── Image hero ── */}
              {item.img ? (
                <div className="relative w-full overflow-hidden bg-background-light dark:bg-background-dark" style={{ height: '180px' }}>
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ display: 'block' }}
                  />
                  {/* Subtle bottom fade so content sits above it cleanly */}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-light/80 dark:from-surface-dark/80 via-transparent to-transparent" />
                  {/* Step number */}
                  <div className={`absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${idx === 0 ? 'bg-primary text-white' : 'bg-black/50 text-white'}`}>
                    {idx + 1}
                  </div>
                  {/* Badge */}
                  <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm ${item.tagColor}`}>
                    {item.badge}
                  </span>
                  {/* Lock icon overlay for free users */}
                  {!isLiteUser && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                        <span className="text-white text-xs font-bold">Lite required</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* AIPT — no image, use a rich gradient panel */
                <div className={`relative w-full bg-gradient-to-br ${item.gradient} flex flex-col items-center justify-center gap-3`} style={{ height: '180px' }}>
                  <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                  <span className="material-symbols-outlined text-5xl text-neon-purple/60" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
                  <p className="text-neon-purple/70 text-xs font-bold uppercase tracking-widest">Full Mock · NTA Pattern</p>
                  {/* Step + badge */}
                  <div className={`absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${idx === 0 ? 'bg-primary text-white' : 'bg-white/10 text-white'}`}>
                    {idx + 1}
                  </div>
                  <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${item.tagColor}`}>
                    {item.badge}
                  </span>
                  {!isLiteUser && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                        <span className="text-white text-xs font-bold">Lite required</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Content ── */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h3 className="font-bold font-grotesk text-text-light dark:text-text-dark text-lg leading-tight">{item.title}</h3>
                  <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 text-2xl mt-0.5">
                    {isLiteUser ? 'arrow_forward' : 'lock_open'}
                  </span>
                </div>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed mb-3">{item.desc}</p>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${item.tagColor}`}>
                  {item.tag}
                </span>
                {!isLiteUser && (
                  <span className="ml-2 inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    Upgrade to unlock →
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Bottom insecurity nudge */}
        <div className="mt-6 rounded-2xl border border-error-light/20 dark:border-error-dark/20 bg-error-light/5 dark:bg-error-dark/5 p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-error-light dark:text-error-dark text-lg shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>trending_down</span>
          <div>
            <p className="text-sm font-bold text-text-light dark:text-text-dark mb-0.5">The students skipping this are already losing rank</p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              Every resource here is used by students who turned their Jan score into a better April rank. The ones who don't? They already know they should have.
            </p>
          </div>
        </div>

        {/* Back nav */}
        <div className="mt-6">
          <button onClick={() => goTo(4)} className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors font-medium text-sm">
            <span className="material-symbols-outlined text-xl">arrow_back</span> Back to Results
          </button>
        </div>
      </div>
    );
  };

  // ─── Root render ─────────────────────────────────────────────────────────────

  if (dbLoading) {
    return (
      <div className="p-3 sm:p-6 md:p-8 max-w-3xl mx-auto flex items-center justify-center min-h-48">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Loading your data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <StepIndicator current={step} />
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}

      {/* Login Gate Modal */}
      {showLoginGate && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLoginGate(false)}
        >
          <div
            className="w-full max-w-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/90 to-primary px-6 py-7 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
              <span className="material-symbols-outlined text-white text-3xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
              <h2 className="text-white text-lg font-bold font-grotesk">Sign in to continue</h2>
              <p className="text-white/75 text-xs mt-1">Your results will be saved so you never have to re-enter data</p>
            </div>

            <div className="p-5 space-y-4">
              {/* Google */}
              <button
                onClick={async () => {
                  setLoginError('');
                  // sessionStorage already set in handleStep1Next
                  localStorage.setItem('authReturnTo', '/jee-predictor');
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: window.location.origin + '/auth/callback' },
                  });
                  if (error) setLoginError(error.message);
                }}
                className="w-full flex items-center justify-center gap-3 border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark hover:bg-surface-light dark:hover:bg-surface-dark rounded-xl py-3 px-4 font-semibold text-sm text-text-light dark:text-text-dark transition-all active:scale-[0.98]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border-light dark:bg-border-dark" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">or</span>
                <div className="flex-1 h-px bg-border-light dark:bg-border-dark" />
              </div>

              {/* Email / Password */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoginError('');
                  setLoginLoading(true);
                  const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
                  setLoginLoading(false);
                  if (error) { setLoginError(error.message); return; }
                  setShowLoginGate(false);
                  // Auth state update will trigger the DB load effect which advances the step
                }}
                className="space-y-2.5"
              >
                <input
                  type="email" required placeholder="Email"
                  value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm text-text-light dark:text-text-dark placeholder-text-secondary-light/50 dark:placeholder-text-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  type="password" required placeholder="Password"
                  value={loginPassword} onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm text-text-light dark:text-text-dark placeholder-text-secondary-light/50 dark:placeholder-text-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                {loginError && <p className="text-xs text-error-light dark:text-error-dark">{loginError}</p>}
                <button
                  type="submit" disabled={loginLoading}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] text-sm"
                >
                  {loginLoading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
                No account?{' '}
                <button
                  onClick={() => { setShowLoginGate(false); navigate('/signup', { state: { from: '/jee-predictor' } }); }}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign up free
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lite Upgrade Popup */}
      {showUpgradePopup && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowUpgradePopup(false)}
        >
          <div
            className="w-full max-w-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Gradient header */}
            <div className="bg-gradient-to-br from-primary via-primary/80 to-neon-purple px-6 py-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <span className="material-symbols-outlined text-white text-4xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              <h2 className="text-white text-xl font-bold font-grotesk">Unlock Your Full Plan</h2>
              <p className="text-white/80 text-sm mt-1">April is {Math.max(0, Math.ceil((JEE_APRIL_DATE.getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)))} days away</p>
            </div>

            <div className="p-6">
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4 text-center leading-relaxed">
                Get full access to every set, mock test, and the complete April roadmap.
                <span className="font-bold text-text-light dark:text-text-dark"> Students on Lite improve by an avg of 20+ marks in their April attempt.</span>
              </p>

              {/* Feature list */}
              <div className="space-y-2 mb-6">
                {['All Question Sets (PYQ, A&R, 360°, Fast Track)', 'AIPT Full Mock Tests — JEE Main pattern', 'AI Insights on your weak chapters', 'Unlimited practice across all subjects'].map(feat => (
                  <div key={feat} className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-xs text-text-light dark:text-text-dark font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setShowUpgradePopup(false); navigate('/pricing'); }}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 text-sm"
              >
                See Plans — Start Today
              </button>
              <button
                onClick={() => setShowUpgradePopup(false)}
                className="w-full mt-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors text-xs py-2"
              >
                Maybe later (I'll regret this)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JEEPredictor;
