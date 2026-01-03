export default function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Calendar Grid Skeleton */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 border border-white/50">
        {/* Calendar Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-7 bg-gray-200 rounded w-32 sm:w-48 animate-pulse" />
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Today Button Skeleton */}
        <div className="mb-4">
          <div className="w-full h-10 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        {/* Day Names Skeleton */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {Array(7).fill(0).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>

        {/* Calendar Days Skeleton */}
        <div className="grid grid-cols-7 gap-1">
          {Array(35).fill(0).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Selected Date Skeleton */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 border border-white/50">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
        </div>

        {/* Meal Card Skeletons */}
        <div className="space-y-4 sm:space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-white/50">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full h-48 sm:w-48 sm:h-48 flex-shrink-0 bg-gray-200 animate-pulse" />
                <div className="flex-1 p-4 sm:p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}