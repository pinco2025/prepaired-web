import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

type Feedback = {
  id: string;
  user_id: string;
  aipt_rating: number | null;
  question_set_rating: number | null;
  ux_rating: number | null;
  remarks: string | null;
  submitted_at: string | null;
};

const Stars: React.FC<{ rating: number | null }> = ({ rating }) => {
  if (rating === null) return <span className="text-text-secondary-light dark:text-text-secondary-dark">—</span>;
  return (
    <span className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-sm leading-none ${i <= rating ? 'text-yellow-400' : 'text-border-light dark:text-border-dark'}`}>★</span>
      ))}
    </span>
  );
};

const AdminFeedbacks: React.FC = () => {
  const { subscriptionType, loading } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
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
      .from('user_feedback')
      .select('id, user_id, aipt_rating, question_set_rating, ux_rating, remarks, submitted_at')
      .order('submitted_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setFeedbacks(data ?? []);
        setFetching(false);
      });
  }, [loading, subscriptionType]);

  if (loading || subscriptionType !== 'admin') return null;

  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-3xl text-primary">feedback</span>
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">User Feedbacks</h1>
          </div>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
            {fetching ? 'Loading…' : `${feedbacks.length} submission${feedbacks.length !== 1 ? 's' : ''}`}
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

        {!fetching && !error && feedbacks.length === 0 && (
          <div className="text-center py-12 text-text-secondary-light dark:text-text-secondary-dark text-sm">No feedbacks yet.</div>
        )}

        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-xs font-mono text-text-secondary-light dark:text-text-secondary-dark truncate flex-1">{fb.user_id}</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark shrink-0">
                  {fb.submitted_at ? new Date(fb.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'AIPT', value: fb.aipt_rating },
                  { label: 'Q-Set', value: fb.question_set_rating },
                  { label: 'UX', value: fb.ux_rating },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center bg-background-light dark:bg-background-dark rounded-xl py-2">
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-1">{label}</p>
                    <div className="flex justify-center">
                      <Stars rating={value} />
                    </div>
                  </div>
                ))}
              </div>

              {fb.remarks && (
                <p className="text-sm text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark rounded-xl px-3 py-2 leading-relaxed">
                  {fb.remarks}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdminFeedbacks;
