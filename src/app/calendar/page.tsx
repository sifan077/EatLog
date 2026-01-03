import { getMealLogsByDate } from '../actions';
import { createClient } from '@/utils/supabase/server';
import { getStartOfDay, getEndOfDay } from '@/utils/date';
import DashboardLayout from '@/components/DashboardLayout';
import Calendar from '@/components/Calendar';
import { MealLog } from '@/lib/types';

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-white/50">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">请先登录</h2>
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

  let mealLogs: MealLog[] = [];
  let error = null;

  try {
    // Get all meal logs (for calendar display)
    // In production, you might want to limit this to a date range
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1); // 3 months ago
    const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0); // 3 months later

    mealLogs = await getMealLogsByDate(startDate, endDate);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch meal logs';
  }

  // Get signed URLs for all photos
  const photoUrlsMap = new Map<string, (string | null)[]>();
  await Promise.all(
    mealLogs.map(async (meal) => {
      try {
        const photoUrls = await Promise.all(
          meal.photo_paths.map(async (photoPath) => {
            const { data, error: urlError } = await supabase.storage
              .from('meal-photos')
              .createSignedUrl(photoPath, 60 * 60 * 24); // 24 hours expiry

            if (urlError) {
              console.error('Failed to create signed URL:', urlError);
              return null;
            }

            return data?.signedUrl || null;
          })
        );

        photoUrlsMap.set(meal.id, photoUrls);
      } catch (err) {
        console.error('Error creating signed URLs:', err);
        photoUrlsMap.set(
          meal.id,
          meal.photo_paths.map(() => null)
        );
      }
    })
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-4 transition-colors duration-300">
        {/* Page Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            日历浏览
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">查看历史记录</p>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 pb-8 sm:px-6 sm:pb-12">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <Calendar mealLogs={mealLogs} photoUrlsMap={photoUrlsMap} />
        </main>
      </div>
    </DashboardLayout>
  );
}
