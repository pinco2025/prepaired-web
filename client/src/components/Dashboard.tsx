import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User } from '@supabase/supabase-js';
import DailyStudyPlan from './DailyStudyPlan';
import RecentActivity from './RecentActivity';
import RecommendedForYou from './RecommendedForYou';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [examType, setExamType] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data) {
        const u = data.user ?? null;
        setUser(u);
        try {
          const userId = u?.id ?? null;
          if (userId) {
            const { data: profileData, error: profileError } = await supabase
              .from('users')
              .select('exam_type')
              .eq('id', userId)
              .single();

            if (!profileError && profileData) {
              const raw = (profileData as any).exam_type ?? null;
              const normalized = typeof raw === 'string' ? raw.trim() : raw;
              setExamType(normalized);
            } else {
              setExamType(null);
            }
          } else {
            setExamType(null);
          }
        } catch (err) {
          setExamType(null);
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">
            Welcome back, {user?.user_metadata.full_name || 'Aspirant'}!
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Let's continue your journey to ace the {examType ?? 'JEE'} exam.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <DailyStudyPlan />
            <RecentActivity />
          </div>
          <div className="lg:col-span-1">
            <RecommendedForYou />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
