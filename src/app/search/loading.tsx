import DashboardLayout from '@/components/DashboardLayout';
import MealCardSkeleton from '@/components/MealCardSkeleton';

export default function SearchLoading() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-4 transition-colors duration-300">
        {/* Page Header Skeleton */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
          <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-28 mt-1 animate-pulse" />
        </div>

        {/* Main Content Skeleton */}
        <main className="max-w-4xl mx-auto px-4 pb-8 sm:px-6 sm:pb-12">
          {/* Search Input Skeleton */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 border border-white/50 dark:border-gray-800/50 mb-6 transition-colors duration-300">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>

          {/* Search Results Skeleton */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
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
