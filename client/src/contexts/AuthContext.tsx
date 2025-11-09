import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User } from '@supabase/supabase-js';

type AuthContextValue = {
  user: User | null;
  subscriptionType: string | null;
  loading: boolean;
  examType: string | null;
};

const AuthContext = createContext<AuthContextValue>({ user: null, subscriptionType: null, loading: true, examType: null });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [examType, setExamType] = useState<string | null>(null);
  // track which user's examType we've fetched to avoid repeated fetches on minor auth events
  const lastExamFetchedFor = React.useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async (showLoading: boolean = true) => {
      if (showLoading) setLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        const u = data?.user ?? null;
        if (!mounted) return;
        // if the signed-in user hasn't changed, avoid re-running expensive profile reads
        if (u && user && u.id === user.id) {
          // update the user object but don't re-fetch profile/exam if already fetched
          setUser(u);
          if (showLoading && mounted) setLoading(false);
          return;
        }
        setUser(u);
        // First try to read `subscription_tier` from the `users` table (owned by Supabase auth schema)
        // Table: users, column: subscription_tier
        if (u) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('subscription_tier')
              .eq('id', u.id)
              .single();

            if (!mounted) return;

            if (profileError) {
              // fallback to metadata if table read fails
              const meta: any = u.user_metadata ?? {};
              const subs = meta.subscription || meta.subscription_type || meta.plan || meta.role || null;
              setSubscriptionType(subs ?? null);
            } else {
              const subsFromTable = (profile as any)?.subscription_tier ?? null;
              const meta = (u.user_metadata ?? {} ) as any;
              const rawSub = (subsFromTable ?? meta.subscription ?? meta.subscription_type ?? meta.plan ?? meta.role) ?? null;
              // normalize to a trimmed, lower-case string when possible
              const normalized = typeof rawSub === 'string' ? rawSub.trim().toLowerCase() : null;
              setSubscriptionType(normalized);
            }
          } catch (tblErr) {
            const meta: any = u.user_metadata ?? {};
            const subs = meta.subscription || meta.subscription_type || meta.plan || meta.role || null;
            setSubscriptionType(subs ?? null);
          }
          // now fetch exam_type once for this user (cache by user id)
          try {
            if (lastExamFetchedFor.current !== u.id) {
              const { data: profileExam, error: examError } = await supabase
                .from('users')
                .select('exam_type')
                .eq('id', u.id)
                .single();

              if (!mounted) return;

              if (!examError && profileExam) {
                const raw = (profileExam as any).exam_type ?? null;
                const normalized = typeof raw === 'string' ? raw.trim() : raw;
                setExamType(normalized);
              } else {
                // fallback to metadata or null
                const meta: any = u.user_metadata ?? {};
                const raw = meta.exam_type ?? null;
                setExamType(typeof raw === 'string' ? raw.trim() : raw ?? null);
              }

              lastExamFetchedFor.current = u.id;
            }
          } catch (examErr) {
            if (mounted) setExamType(null);
          }
        } else {
          setSubscriptionType(null);
          setExamType(null);
          lastExamFetchedFor.current = null;
        }
      } catch (err) {
        setUser(null);
        setSubscriptionType(null);
        setExamType(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        setUser(null);
        setSubscriptionType(null);
        setExamType(null);
        lastExamFetchedFor.current = null;
        setLoading(false);
      } else {
        // refetch when auth changes but don't toggle global loading (prevents UI flash on tab switch)
        fetchUser(false);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, subscriptionType, loading, examType }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
