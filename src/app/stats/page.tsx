import { createClient } from '@/utils/supabase/server';
import DashboardLayout from '@/components/DashboardLayout';
import AiRecommendation from '@/components/AiRecommendation';

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName = user?.user_metadata?.display_name || user?.email || '用户';

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-4 transition-colors duration-300">
        {/* Page Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            AI 饮食推荐
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {displayName} 的智能饮食建议
          </p>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 pb-8 sm:px-6 sm:pb-12">
          {/* AI Recommendation */}
          <section>
            <AiRecommendation />
          </section>
        </main>
      </div>
    </DashboardLayout>
  );
}
