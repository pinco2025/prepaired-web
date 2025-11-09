import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User } from '@supabase/supabase-js';

type AuthContextValue = {
  user: User | null;
  subscriptionType: string | null;
  examType: string | null;
  fullName: string | null;
  email: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ user: null, subscriptionType: null, examType: null, fullName: null, email: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null);
  const [examType, setExamType] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        const u = data?.user ?? null;
        if (!mounted) return;
        setUser(u);
        // Read profile fields from the `users` table: subscription_tier, exam_type, full_name
        if (u) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('subscription_tier, exam_type, full_name')
              .eq('id', u.id)
              .single();

            if (!mounted) return;

            if (!profileError && profile) {
              const subsRaw = (profile as any)?.subscription_tier ?? null;
              const examRaw = (profile as any)?.exam_type ?? null;
              const nameRaw = (profile as any)?.full_name ?? null;

              const normalizedSub = typeof subsRaw === 'string' ? subsRaw.trim().toLowerCase() : null;
              const normalizedExam = typeof examRaw === 'string' ? examRaw.trim() : null;
              const normalizedName = typeof nameRaw === 'string' ? nameRaw.trim() : null;

              setSubscriptionType(normalizedSub);
              setExamType(normalizedExam);
              setFullName(normalizedName ?? (u.user_metadata as any)?.full_name ?? null);
              setEmail(u.email ?? null);
            } else {
              // fallback to metadata
              const meta: any = u.user_metadata ?? {};
              const subs = meta.subscription || meta.subscription_type || meta.plan || meta.role || null;
              const normalizedSub = typeof subs === 'string' ? subs.trim().toLowerCase() : null;
              const examMeta = meta.exam_type ?? null;
              const normalizedExam = typeof examMeta === 'string' ? examMeta.trim() : null;
              const nameMeta = meta.full_name ?? meta.name ?? null;
              const normalizedName = typeof nameMeta === 'string' ? nameMeta.trim() : null;

              setSubscriptionType(normalizedSub);
              setExamType(normalizedExam);
              setFullName(normalizedName);
              setEmail(u.email ?? null);
            }
          } catch (tblErr) {
            const meta: any = u.user_metadata ?? {};
            const subs = meta.subscription || meta.subscription_type || meta.plan || meta.role || null;
            const normalizedSub = typeof subs === 'string' ? subs.trim().toLowerCase() : null;
            const examMeta = meta.exam_type ?? null;
            const normalizedExam = typeof examMeta === 'string' ? examMeta.trim() : null;
            const nameMeta = meta.full_name ?? meta.name ?? null;
            const normalizedName = typeof nameMeta === 'string' ? nameMeta.trim() : null;

            setSubscriptionType(normalizedSub);
            setExamType(normalizedExam);
            setFullName(normalizedName);
            setEmail(u.email ?? null);
          }
        } else {
          setSubscriptionType(null);
          setExamType(null);
          setFullName(null);
          setEmail(null);
        }
      } catch (err) {
        setUser(null);
        setSubscriptionType(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        setUser(null);
        setSubscriptionType(null);
        setLoading(false);
      } else {
        // refetch when auth changes
        fetchUser();
      }
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, subscriptionType, examType, fullName, email, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
