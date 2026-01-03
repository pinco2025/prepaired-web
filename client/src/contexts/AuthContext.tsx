import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User } from '@supabase/supabase-js';

// Define subscription tiers
export const PAID_SUBSCRIPTION = 'ipft-01-2026';

type AuthContextValue = {
  user: User | null;
  subscriptionType: string | null;
  loading: boolean; // True while initial auth check is happening
  isAuthenticated: boolean; // True if user is logged in
  isPaidUser: boolean; // True only if subscription is IPFT-01-2026
  examType: string | null;
  refreshSubscription: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  subscriptionType: null,
  loading: true,
  isAuthenticated: false,
  isPaidUser: false,
  examType: null,
  refreshSubscription: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [examType, setExamType] = useState<string | null>(null);

  // Fetch subscription data from database
  const fetchSubscription = useCallback(async (userId: string): Promise<string | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      const tier = profile?.subscription_tier ?? null;
      // Normalize to lowercase for consistent comparison
      return typeof tier === 'string' ? tier.trim().toLowerCase() : null;
    } catch (err) {
      console.error('Error in fetchSubscription:', err);
      return null;
    }
  }, []);

  // Fetch exam type from database
  const fetchExamType = useCallback(async (userId: string): Promise<string | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('exam_type')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching exam type:', error);
        return null;
      }

      const exam = profile?.exam_type ?? null;
      return typeof exam === 'string' ? exam.trim() : null;
    } catch (err) {
      console.error('Error in fetchExamType:', err);
      return null;
    }
  }, []);

  // Full user data fetch
  const fetchUserData = useCallback(async (currentUser: User) => {
    const [subscription, exam] = await Promise.all([
      fetchSubscription(currentUser.id),
      fetchExamType(currentUser.id),
    ]);

    setSubscriptionType(subscription);
    setExamType(exam);
  }, [fetchSubscription, fetchExamType]);

  // Manual refresh function for after payment
  const refreshSubscription = useCallback(async () => {
    if (user) {
      const subscription = await fetchSubscription(user.id);
      setSubscriptionType(subscription);
    }
  }, [user, fetchSubscription]);

  // Initial auth check and subscription handler
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await fetchUserData(session.user);
        } else {
          setUser(null);
          setSubscriptionType(null);
          setExamType(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        if (mounted) {
          setUser(null);
          setSubscriptionType(null);
          setExamType(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);

        if (session?.user) {
          setUser(session.user);
          // Fetch subscription data whenever auth state changes
          await fetchUserData(session.user);
        } else {
          setUser(null);
          setSubscriptionType(null);
          setExamType(null);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.unsubscribe();
    };
  }, [fetchUserData]);

  // Computed values
  const isAuthenticated = user !== null;
  const isPaidUser = subscriptionType?.toLowerCase() === PAID_SUBSCRIPTION.toLowerCase();

  const value: AuthContextValue = {
    user,
    subscriptionType,
    loading,
    isAuthenticated,
    isPaidUser,
    examType,
    refreshSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
