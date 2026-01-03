import DashboardLayout from '@/components/DashboardLayout';

export default function EditLoading() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 pt-4">
        {/* Page Header Skeleton */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-24 mt-4 animate-pulse" />
        </div>

        {/* Main Content Skeleton */}
        <main className="max-w-4xl mx-auto px-4 pb-8 sm:px-6 sm:pb-12">
          {/* Edit Form Skeleton */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/50">
            <div className="h-7 bg-gray-200 rounded w-32 mb-6 animate-pulse" />

            {/* Photo Skeleton */}
            <div className="mb-6">
              <div className="h-5 bg-gray-200 rounded w-12 mb-3 animate-pulse" />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-28 sm:h-32 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
              <div className="h-32 bg-gray-200 rounded-xl mt-4 animate-pulse" />
            </div>

            {/* Content Skeleton */}
            <div className="mb-6">
              <div className="h-5 bg-gray-200 rounded w-12 mb-2 animate-pulse" />
              <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
            </div>

            {/* Meal Type Skeleton */}
            <div className="mb-6">
              <div className="h-5 bg-gray-200 rounded w-12 mb-2 animate-pulse" />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>

            {/* Time Skeleton */}
            <div className="mb-6">
              <div className="h-5 bg-gray-200 rounded w-16 mb-2 animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>

            {/* Price Skeleton */}
            <div className="mb-6">
              <div className="h-5 bg-gray-200 rounded w-12 mb-2 animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>

            {/* Location Skeleton */}
            <div className="mb-6">
              <div className="h-5 bg-gray-200 rounded w-12 mb-2 animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>

            {/* Tags Skeleton */}
            <div className="mb-6">
              <div className="h-5 bg-gray-200 rounded w-12 mb-2 animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex gap-2 mt-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="w-24 h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}