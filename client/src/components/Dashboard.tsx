import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SubjectsCard from './SubjectsCard';
import PercentileCard, { ChartData } from './PercentileCard';
import WeakAreasCard from './WeakAreasCard';
import AccuracyCard from './AccuracyCard';
import AverageScoreCard from './AverageScoreCard';
import DashboardSkeleton from './DashboardSkeleton';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { UserAnalytics } from '../data';
import { usePageTitle } from '../hooks/usePageTitle';

const Dashboard: React.FC = () => {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [historyData, setHistoryData] = useState<ChartData[]>([]);
  const [chapterData, setChapterData] = useState<Record<string, { attempted: number; unattempted: number; correct: number; incorrect: number; total_questions: number }> | null>(null);
  const [recentScores, setRecentScores] = useState<{ score: number; label: string }[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchAnalytics = async () => {
      if (!user) {
        if (mounted) setLoading(false);
        return;
      }

      if (mounted) setLoading(true);

      try {
        const { data, error } = await supabase
          .from('user_analytics')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (mounted && !error && data) {
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAnalytics();

    return () => {
      mounted = false;
    };
  }, [user, location.key]); // location.key changes on navigation, triggering re-fetch

  useEffect(() => {
    const fetchHistoryData = async () => {
      if (!analytics?.history_url) return;

      try {
        const response = await fetch(analytics.history_url);
        const data = await response.json();

        const sortedData = Array.isArray(data)
          ? data.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          : [];

        // Prepare data for AverageScoreCard (Last 5 tests)
        // Ensure we take the last 5 entries, pad with empty/null if needed is handled in component, 
        // but here we just pass the valid ones.
        const scoresData = sortedData.map((item: any, index: number) => ({
          score: Math.round((item.phy_score || 0) + (item.chem_score || 0) + (item.math_score || 0)),
          label: `T${index + 1}`
        }));
        setRecentScores(scoresData); // We pass all, component can slice/filter

        // Fetch test IDs for all attempt IDs (existing logic...)
        const attemptIds = sortedData.map((item: any) => item.test_attempt_id).filter(Boolean);
        let testIdMap: Record<string, string> = {};

        if (attemptIds.length > 0) {
          const { data: testData } = await supabase
            .from('student_tests')
            .select('id, test_id')
            .in('id', attemptIds);

          if (testData) {
            testIdMap = testData.reduce((acc: Record<string, string>, item: any) => {
              acc[item.id] = item.test_id;
              return acc;
            }, {});
          }
        }

        const formattedData = sortedData.map((item: any, index: number) => {
          // ... (existing percentile logic)
          let trend: 'up' | 'down' | 'neutral' = 'neutral';
          if (index > 0) {
            const prevPercentile = sortedData[index - 1]?.percentile || 0;
            const currentPercentile = item.percentile || 0;
            if (currentPercentile > prevPercentile) {
              trend = 'up';
            } else if (currentPercentile < prevPercentile) {
              trend = 'down';
            }
          }

          return {
            label: `Test ${index + 1}`,
            date: item.timestamp
              ? new Date(item.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
              : '',
            value: Math.round((item.percentile || 0) * 10) / 10,
            testId: testIdMap[item.test_attempt_id] || undefined,
            trend,
          };
        });

        setHistoryData(formattedData);
      } catch (err) {
        console.error('Error fetching history:', err);
      }
    };

    fetchHistoryData();
  }, [analytics?.history_url]);

  // Fetch chapter data for WeakAreasCard
  useEffect(() => {
    const fetchChapterData = async () => {
      console.log('[DEBUG] analytics?.chapter_url:', analytics?.chapter_url);
      if (!analytics?.chapter_url) {
        console.log('[DEBUG] No chapter_url found, skipping fetch');
        return;
      }

      try {
        console.log('[DEBUG] Fetching chapter data from:', analytics.chapter_url);
        const response = await fetch(analytics.chapter_url);
        console.log('[DEBUG] Chapter fetch response status:', response.status);
        const data = await response.json();
        console.log('[DEBUG] Chapter data received:', data);
        // Extract chapters from the nested structure (data.chapters) if present
        const chapters = data.chapters || data;
        console.log('[DEBUG] Extracted chapters:', chapters);
        setChapterData(chapters);
      } catch (err) {
        console.error('Error fetching chapter data:', err);
      }
    };

    fetchChapterData();
  }, [analytics?.chapter_url]);

  // Calculate derived values
  const phyScore = analytics && analytics.attempt_no ? Math.round(analytics.phy_avg / analytics.attempt_no) : 0;
  const chemScore = analytics && analytics.attempt_no ? Math.round(analytics.chem_avg / analytics.attempt_no) : 0;
  const mathScore = analytics && analytics.attempt_no ? Math.round(analytics.math_avg / analytics.attempt_no) : 0;
  const accuracy = analytics && analytics.attempt_no ? Math.round(analytics.accuracy / analytics.attempt_no) : 0;
  const percentile = analytics && analytics.attempt_no && analytics.percentile ? Math.round((analytics.percentile / analytics.attempt_no) * 10) / 10 : 0;

  const totalAverageScore = phyScore + chemScore + mathScore;

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Check if user has no analytics data or no attempts
  const hasNoAttempts = !analytics || !analytics.attempt_no || analytics.attempt_no === 0;

  if (hasNoAttempts) {
    return (
      <div className="p-3 sm:p-4 md:p-6 h-full md:h-screen flex flex-col items-center justify-center animate-fade-in-up">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30 flex items-center justify-center">
            <svg
              className="w-12 h-12 sm:w-16 sm:h-16 text-primary dark:text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-light dark:text-text-dark mb-3">
            No Tests Attempted Yet
          </h2>
          <p className="text-sm sm:text-base text-text-secondary-light dark:text-text-secondary-dark mb-8">
            You haven't attempted any tests yet. Start your first test to see your performance analytics and track your progress!
          </p>
          <button
            onClick={() => navigate('/tests')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            Start Your First Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 h-full md:h-screen animate-fade-in-up overflow-y-auto md:overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
        <div className="mb-3 sm:mb-4 shrink-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-light dark:text-text-dark">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Student'}!</h1>
          <p className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark mt-0.5 sm:mt-1">Here's your prepAIred learning summary.</p>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-3 sm:gap-4 pb-3 sm:pb-4 md:min-h-0">
          {/* Row 1 */}
          <div className="col-span-1 md:col-span-12 lg:col-span-7 h-[280px] sm:h-[320px] md:h-full md:min-h-0">
            <SubjectsCard averages={{ physics: phyScore, chemistry: chemScore, maths: mathScore }} />
          </div>
          <div className="col-span-1 md:col-span-12 lg:col-span-5 h-[280px] sm:h-[320px] md:h-full md:min-h-0">
            <PercentileCard percentile={percentile} historyData={historyData} />
          </div>

          {/* Row 2 */}
          <div className="col-span-1 md:col-span-6 lg:col-span-4 h-[250px] sm:h-[280px] md:h-full md:min-h-0">
            <WeakAreasCard chapterData={chapterData} />
          </div>
          <div className="col-span-1 md:col-span-6 lg:col-span-4 h-[250px] sm:h-[280px] md:h-full md:min-h-0">
            <AccuracyCard accuracy={accuracy} />
          </div>
          <div className="col-span-1 md:col-span-12 lg:col-span-4 h-[250px] sm:h-[280px] md:h-full md:min-h-0">
            <AverageScoreCard averageScore={totalAverageScore} recentScores={recentScores} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
