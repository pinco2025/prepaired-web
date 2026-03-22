import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

type Status = 'idle' | 'loading' | 'success' | 'error';

const AdminPlaceholder: React.FC = () => {
  const { subscriptionType, loading } = useAuth();
  const navigate = useNavigate();

  const [submissionId, setSubmissionId] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && subscriptionType !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [subscriptionType, loading, navigate]);

  const handleCalculate = async () => {
    const trimmed = submissionId.trim();
    if (!trimmed) return;

    setStatus('loading');
    setMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(
        `https://prepaired-backend.onrender.com/api/v1/scores/${trimmed}/calculate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        }
      );

      if (res.ok) {
        setStatus('success');
        setMessage(`Score calculation triggered successfully for submission: ${trimmed}`);
      } else {
        const body = await res.text();
        setStatus('error');
        setMessage(`Request failed (${res.status}): ${body || res.statusText}`);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(`Network error: ${err?.message ?? 'Unknown error'}`);
    }
  };

  if (loading || subscriptionType !== 'admin') return null;

  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-3xl text-primary">admin_panel_settings</span>
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">Admin Panel</h1>
          </div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Internal tools for prepAIred administrators.
          </p>
        </div>

        {/* Score Calculator Card */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-xl text-primary">calculate</span>
            <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">Score Calculator</h2>
          </div>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-5">
            Enter a <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono">student_tests</code> attempt ID to manually trigger result calculation via the backend.
          </p>

          <div className="flex gap-3">
            <input
              type="text"
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              placeholder="Enter attempt / submission ID"
              className="flex-1 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-light dark:text-text-dark placeholder-text-secondary-light/50 dark:placeholder-text-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              disabled={status === 'loading'}
            />
            <button
              onClick={handleCalculate}
              disabled={!submissionId.trim() || status === 'loading'}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></span>
                  <span>Running…</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">play_arrow</span>
                  <span>Calculate</span>
                </>
              )}
            </button>
          </div>

          {/* Status message */}
          {status !== 'idle' && status !== 'loading' && (
            <div
              className={`mt-4 flex items-start gap-2 px-4 py-3 rounded-xl text-sm ${
                status === 'success'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
              }`}
            >
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">
                {status === 'success' ? 'check_circle' : 'error'}
              </span>
              <span className="break-all">{message}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminPlaceholder;
