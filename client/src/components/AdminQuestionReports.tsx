import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

type Report = {
  id: string;
  question_uuid: string;
  reported_parts: string[];
  user_id: string | null;
  reported_at: string | null;
};

const AdminQuestionReports: React.FC = () => {
  const { subscriptionType, loading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && subscriptionType !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [subscriptionType, loading, navigate]);

  useEffect(() => {
    if (loading || subscriptionType !== 'admin') return;
    supabase
      .from('question_reports')
      .select('id, question_uuid, reported_parts, user_id, reported_at')
      .order('reported_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setReports(data ?? []);
        setFetching(false);
      });
  }, [loading, subscriptionType]);

  if (loading || subscriptionType !== 'admin') return null;

  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-3xl text-primary">flag</span>
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">Question Reports</h1>
          </div>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
            {fetching ? 'Loading…' : `${reports.length} report${reports.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {fetching && (
          <div className="flex justify-center py-12">
            <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        {!fetching && !error && reports.length === 0 && (
          <div className="text-center py-12 text-text-secondary-light dark:text-text-secondary-dark text-sm">No reports yet.</div>
        )}

        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-0.5">Question UUID</p>
                  <p className="text-xs font-mono text-text-light dark:text-text-dark truncate">{r.question_uuid}</p>
                </div>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark shrink-0">
                  {r.reported_at ? new Date(r.reported_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {(r.reported_parts ?? []).map((part) => (
                  <span
                    key={part}
                    className="px-2 py-0.5 text-xs rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 capitalize"
                  >
                    {part.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>

              <p className="text-xs font-mono text-text-secondary-light dark:text-text-secondary-dark truncate">
                {r.user_id ? `User: ${r.user_id}` : 'Anonymous'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdminQuestionReports;
