import DashboardLayout from '@/components/DashboardLayout';
import CalendarSkeleton from '@/components/CalendarSkeleton';

export default function CalendarLoading() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-4 transition-colors duration-300">
        {/* Page Header Skeleton */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
          <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mt-1 animate-pulse" />
        </div>

        {/* Main Content Skeleton */}
        <main className="max-w-4xl mx-auto px-4 pb-8 sm:px-6 sm:pb-12">
          <CalendarSkeleton />
        </main>
      </div>
    </DashboardLayout>
  );
}
