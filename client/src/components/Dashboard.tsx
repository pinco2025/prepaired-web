import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [historyData, setHistoryData] = useState<ChartData[]>([]);
  const [chapterData, setChapterData] = useState<Record<string, { attempted: number; unattempted: number; correct: number; incorrect: number; total_questions: number }> | null>(null);
  const [recentScores, setRecentScores] = useState<{ score: number; label: string }[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_analytics')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
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

  return (
    <div className="p-4 md:p-6 h-full md:h-screen animate-fade-in-up overflow-y-auto md:overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
        <div className="mb-4 shrink-0">
          <h1 className="text-xl md:text-2xl font-bold text-text-light dark:text-text-dark">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Student'}!</h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">Here's your prepAIred learning summary.</p>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-4 pb-4 md:min-h-0">
          {/* Row 1 */}
          <div className="col-span-1 md:col-span-12 lg:col-span-7 h-[380px] md:h-full md:min-h-0">
            <SubjectsCard averages={{ physics: phyScore, chemistry: chemScore, maths: mathScore }} />
          </div>
          <div className="col-span-1 md:col-span-12 lg:col-span-5 h-[380px] md:h-full md:min-h-0">
            <PercentileCard percentile={percentile} historyData={historyData} />
          </div>

          {/* Row 2 */}
          <div className="col-span-1 md:col-span-6 lg:col-span-4 h-[300px] md:h-full md:min-h-0">
            <WeakAreasCard chapterData={chapterData} />
          </div>
          <div className="col-span-1 md:col-span-6 lg:col-span-4 h-[300px] md:h-full md:min-h-0">
            <AccuracyCard accuracy={accuracy} />
          </div>
          <div className="col-span-1 md:col-span-12 lg:col-span-4 h-[300px] md:h-full md:min-h-0">
            <AverageScoreCard averageScore={totalAverageScore} recentScores={recentScores} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
