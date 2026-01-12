import {
  getUserProfile,
  getStreakDays,
  getRecentDaysStats,
  getTopTags,
  getRecentDaysPriceStats,
  getTotalPriceStats,
} from '../actions';
import { createClient } from '@/utils/supabase/server';
import ProfileForm from '@/components/ProfileForm';
import StatsCard from '@/components/StatsCard';
import DashboardLayout from '@/components/DashboardLayout';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 sm:p-12 text-center border border-white/50 dark:border-gray-800/50">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              请先登录
            </h2>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-600 transition-all duration-200"
            >
              前往登录
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const [profile, streakDays, recentDaysStats, topTags, recentDaysPriceStats, priceStats] =
    await Promise.all([
      getUserProfile(),
      getStreakDays(),
      getRecentDaysStats(),
      getTopTags(8),
      getRecentDaysPriceStats(),
      getTotalPriceStats(),
    ]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">个人信息</h1>

          {/* Stats Card */}
          <div className="mb-8">
            <StatsCard
              streakDays={streakDays}
              recentDaysStats={recentDaysStats}
              topTags={topTags}
              priceStats={priceStats}
              recentDaysPriceStats={recentDaysPriceStats}
            />
          </div>

          {/* Profile Form */}
          <ProfileForm profile={profile} />
        </div>
      </div>
    </DashboardLayout>
  );
}
