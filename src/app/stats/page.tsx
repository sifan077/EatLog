import { createClient } from '@/utils/supabase/server';
import { getNutritionAnalysis } from '../actions';
import DashboardLayout from '@/components/DashboardLayout';
import AiRecommendation from '@/components/AiRecommendation';
import NutritionCard from '@/components/NutritionCard';

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName = user?.user_metadata?.display_name || user?.email || '用户';

  // Get nutrition analysis
  let nutritionAnalysis;
  try {
    nutritionAnalysis = await getNutritionAnalysis();
  } catch (err) {
    console.error('Failed to get nutrition analysis:', err);
    nutritionAnalysis = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      averageCaloriesPerMeal: 0,
      mealCount: 0,
      recommendations: [],
    };
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-4 transition-colors duration-300">
        {/* Page Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            统计与推荐
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {displayName} 的饮食分析
          </p>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 pb-8 sm:px-6 sm:pb-12">
          {/* AI Recommendation */}
          <section className="mb-8 sm:mb-10">
            <AiRecommendation />
          </section>

          {/* Nutrition Analysis */}
          <section className="mb-8 sm:mb-10">
            <NutritionCard analysis={nutritionAnalysis} />
          </section>

          {/* Stats Placeholder */}
          <section>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/50 dark:border-gray-800/50 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">📊</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                    饮食统计
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    查看你的饮食数据和趋势
                  </p>
                </div>
              </div>

              <div className="text-center py-8">
                <div className="text-4xl mb-3">📈</div>
                <p className="text-gray-600 dark:text-gray-400">统计功能正在开发中...</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </DashboardLayout>
  );
}
