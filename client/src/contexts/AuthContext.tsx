import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { auth, db } from '../utils/firebaseClient';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Define subscription tiers
export const PAID_SUBSCRIPTION = 'ipft-01-2026';

/**
 * Normalized user object that keeps a compatible shape across the app.
 * - `id` / `uid` → Firebase UID
 * - `email` → user email
 * - `user_metadata` → mirrors Supabase shape for backward compat with
 *   Sidebar, Dashboard, PricingPlans etc. that reference
 *   `user.user_metadata.full_name` / `user.user_metadata.avatar_url`.
 */
export interface AppUser {
  id: string;
  uid: string;
  email: string | null;
  user_metadata: {
    full_name: string | null;
    avatar_url: string | null;
    name?: string | null;
  };
  /** Raw Firebase User if needed */
  _fb: FirebaseUser;
}

function toAppUser(fb: FirebaseUser): AppUser {
  return {
    id: fb.uid,
    uid: fb.uid,
    email: fb.email,
    user_metadata: {
      full_name: fb.displayName,
      avatar_url: fb.photoURL,
      name: fb.displayName,
    },
    _fb: fb,
  };
}

type AuthContextValue = {
  user: AppUser | null;
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
  const [user, setUser] = useState<AppUser | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [examType, setExamType] = useState<string | null>(null);

  // Track if initial load is done
  const initialLoadDone = useRef(false);

  // Fetch subscription data from Firestore
  const fetchSubscription = useCallback(async (userId: string): Promise<string | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;

      const tier = userDoc.data()?.subscription_tier ?? null;
      // Normalize to lowercase for consistent comparison
      return typeof tier === 'string' ? tier.trim().toLowerCase() : null;
    } catch (err) {
      console.error('Error fetching subscription:', err);
      return null;
    }
  }, []);

  // Fetch exam type from Firestore
  const fetchExamType = useCallback(async (userId: string): Promise<string | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;

      const exam = userDoc.data()?.exam_type ?? null;
      return typeof exam === 'string' ? exam.trim() : null;
    } catch (err) {
      console.error('Error fetching exam type:', err);
      return null;
    }
  }, []);

  // Manual refresh function for after payment
  const refreshSubscription = useCallback(async () => {
    if (user) {
      const subscription = await fetchSubscription(user.id);
      setSubscriptionType(subscription);
    }
  }, [user, fetchSubscription]);

  // Listen for auth state changes
  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      if (firebaseUser) {
        const appUser = toAppUser(firebaseUser);
        setUser(appUser);

        // Fetch subscription and exam type in parallel
        const [subscription, exam] = await Promise.all([
          fetchSubscription(firebaseUser.uid),
          fetchExamType(firebaseUser.uid),
        ]);

        if (mounted) {
          setSubscriptionType(subscription);
          setExamType(exam);
        }
      } else {
        setUser(null);
        setSubscriptionType(null);
        setExamType(null);
      }

      if (mounted) {
        setLoading(false);
        initialLoadDone.current = true;
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [fetchSubscription, fetchExamType]); // These are stable due to useCallback with empty deps

  // Computed values
  const isAuthenticated = user !== null;
  const isPaidUser = subscriptionType?.toLowerCase() === PAID_SUBSCRIPTION.toLowerCase() ||
    subscriptionType?.toLowerCase() === 'lite';

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
