import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User } from '@supabase/supabase-js';

type AuthContextValue = {
  user: User | null;
  subscriptionType: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ user: null, subscriptionType: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null);
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
        } else {
          setSubscriptionType(null);
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
    <AuthContext.Provider value={{ user, subscriptionType, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
