import { getTodayMealLogs } from '../actions';
import { createClient } from '@/utils/supabase/server';
import { formatDateDisplay } from '@/utils/date';
import MealCard from '@/components/MealCard';
import QuickRecordForm from '@/components/QuickRecordForm';
import DashboardLayout from '@/components/DashboardLayout';
import { MealLog } from '@/lib/types';

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let mealLogs: MealLog[] = [];
  let error = null;

  try {
    mealLogs = await getTodayMealLogs();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch meal logs';
  }

  // Get signed URLs for all photos with error handling
  const mealLogsWithUrls = await Promise.all(
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

        return {
          ...meal,
          photoUrls,
        };
      } catch (err) {
        console.error('Error creating signed URLs:', err);
        return {
          ...meal,
          photoUrls: meal.photo_paths.map(() => null),
        };
      }
    })
  );

  const displayName = user?.user_metadata?.display_name || user?.email || '用户';
  const today = formatDateDisplay(new Date());

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-4 transition-colors duration-300">
        {/* Page Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {today}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {displayName}
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

          {/* Quick Record Form */}
          <section className="mb-8 sm:mb-10">
            <QuickRecordForm />
          </section>

          {/* Today's Meals */}
          <section>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                今日记录
              </h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {mealLogsWithUrls.length} 条记录
              </span>
            </div>

            {mealLogsWithUrls.length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 sm:p-12 text-center border border-white/50 dark:border-gray-800/50 transition-colors duration-300">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  还没有记录
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  开始记录你的第一餐吧！
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {mealLogsWithUrls.map((meal) => (
                  <MealCard key={meal.id} meal={meal} photoUrls={meal.photoUrls} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </DashboardLayout>
  );
}
