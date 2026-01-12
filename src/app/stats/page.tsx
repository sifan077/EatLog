import {
  getStreakDays,
  getRecentDaysStats,
  getTopTags,
  getTotalPriceStats,
  getRecentDaysPriceStats,
  getRecentWeeksPriceStats,
  getMonthlyPriceStats,
} from '../actions';
import StatsCard from '@/components/StatsCard';
import DashboardLayout from '@/components/DashboardLayout';

export default async function StatsPage() {
  let streakDays = 0;
  let recentDaysStats: Array<{ date: string; mealCount: number; hasRecords: boolean }> = [];
  let topTags: Array<{ tag: string; count: number }> = [];
  let priceStats: {
    todayTotal: number;
    weekTotal: number;
    monthTotal: number;
    averageDaily: number;
  } | null = null;
  let recentDaysPriceStats: Array<{ date: string; totalPrice: number; hasRecords: boolean }> = [];
  let recentWeeksPriceStats: Array<{ date: string; totalPrice: number; hasRecords: boolean }> = [];
  let monthlyPriceStats: Array<{ date: string; totalPrice: number; hasRecords: boolean }> = [];
  let error = null;

  try {
    streakDays = await getStreakDays();
    recentDaysStats = await getRecentDaysStats();
    topTags = await getTopTags(10);
    priceStats = await getTotalPriceStats();
    recentDaysPriceStats = await getRecentDaysPriceStats();
    recentWeeksPriceStats = await getRecentWeeksPriceStats(4);
    monthlyPriceStats = await getMonthlyPriceStats();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch stats';
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-4 transition-colors duration-300">
        {/* Page Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            统计分析
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            查看你的饮食记录和花费统计
          </p>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 pb-8 sm:px-6 sm:pb-12">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Stats Card */}
          <StatsCard
            streakDays={streakDays}
            recentDaysStats={recentDaysStats}
            topTags={topTags}
            priceStats={priceStats || undefined}
            recentDaysPriceStats={recentDaysPriceStats}
            recentWeeksPriceStats={recentWeeksPriceStats}
            monthlyPriceStats={monthlyPriceStats}
          />
        </main>
      </div>
    </DashboardLayout>
  );
}
