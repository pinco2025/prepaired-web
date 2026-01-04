import React, { useState, useEffect } from 'react';
import SubjectsCard from './SubjectsCard';
import PercentileCard, { ChartData } from './PercentileCard';
import WeakAreasCard from './WeakAreasCard';
import AccuracyCard from './AccuracyCard';
import AverageScoreCard from './AverageScoreCard';
import DashboardSkeleton from './DashboardSkeleton';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { UserAnalytics } from '../data';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [historyData, setHistoryData] = useState<ChartData[]>([]);

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
  }, [user]);

  useEffect(() => {
    const fetchHistoryData = async () => {
      if (!analytics?.history_url) return;

      try {
        const response = await fetch(analytics.history_url);
        const data = await response.json();

        const sortedData = Array.isArray(data)
          ? data.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          : [];

        // Fetch test IDs for all attempt IDs
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
          // Calculate trend by comparing with previous percentile
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

  // Calculate derived values
  const phyScore = analytics && analytics.attempt_no ? Math.round(analytics.phy_avg / analytics.attempt_no) : 0;
  const chemScore = analytics && analytics.attempt_no ? Math.round(analytics.chem_avg / analytics.attempt_no) : 0;
  const mathScore = analytics && analytics.attempt_no ? Math.round(analytics.math_avg / analytics.attempt_no) : 0;
  const accuracy = analytics && analytics.attempt_no ? Math.round(analytics.accuracy / analytics.attempt_no) : 0;

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
            <PercentileCard percentile={analytics?.percentile} historyData={historyData} />
          </div>

          {/* Row 2 */}
          <div className="col-span-1 md:col-span-6 lg:col-span-4 h-[300px] md:h-full md:min-h-0">
            <WeakAreasCard />
          </div>
          <div className="col-span-1 md:col-span-6 lg:col-span-4 h-[300px] md:h-full md:min-h-0">
            <AccuracyCard accuracy={accuracy} />
          </div>
          <div className="col-span-1 md:col-span-12 lg:col-span-4 h-[300px] md:h-full md:min-h-0">
            <AverageScoreCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
