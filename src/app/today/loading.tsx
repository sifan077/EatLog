import DashboardLayout from '@/components/DashboardLayout';
import MealCardSkeleton from '@/components/MealCardSkeleton';

export default function TodayLoading() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 pt-4">
        {/* Page Header Skeleton */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-48 sm:w-64 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-32 mt-1 animate-pulse" />
        </div>

        {/* Main Content Skeleton */}
        <main className="max-w-4xl mx-auto px-4 pb-8 sm:px-6 sm:pb-12">
          {/* Quick Record Form Skeleton */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/50 mb-8 sm:mb-10">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Today's Meals Skeleton */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="h-7 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            </div>

            {/* Meal Card Skeletons */}
            {[1, 2, 3].map((i) => (
              <MealCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}