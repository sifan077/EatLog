export default function MealCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-white/50">
      <div className="flex flex-col sm:flex-row">
        {/* Photo Skeleton */}
        <div className="w-full h-48 sm:w-48 sm:h-48 flex-shrink-0 bg-gray-200 animate-pulse" />

        {/* Content Skeleton */}
        <div className="flex-1 p-4 sm:p-6 space-y-3">
          {/* Time Skeleton */}
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />

          {/* Price Skeleton */}
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />

          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>

          {/* Tags Skeleton */}
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
          </div>

          {/* Location Skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
