'use client';

import Link from 'next/link';
import { MealLog } from '@/lib/types';
import { MEAL_TYPES } from '@/lib/constants';
import { formatTimeDisplay } from '@/utils/date';
import { useState } from 'react';

interface MealCardProps {
  meal: MealLog;
  photoUrls: (string | null)[];
}

export default function MealCard({ meal, photoUrls }: MealCardProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const mealType = MEAL_TYPES.find((t) => t.value === meal.meal_type);

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set([...prev, index]));
  };

  const firstPhotoUrl = photoUrls[0];
  const photoCount = meal.photo_paths.length;

  return (
    <Link
      href={`/edit/${meal.id}`}
      className="block bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-white/50 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01]"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Photo */}
        <div className="w-full h-48 sm:w-48 sm:h-48 flex-none relative bg-gray-100 overflow-hidden">
          {firstPhotoUrl && !imageErrors.has(0) ? (
            <img
              src={firstPhotoUrl}
              alt={meal.content || 'Meal photo'}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => handleImageError(0)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-teal-100">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
          {/* Meal Type Badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
            <span className="mr-1">{mealType?.emoji}</span>
            {mealType?.label}
          </div>
          {/* Photo Count Badge */}
          {photoCount > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-sm font-medium">
              {photoCount} 张照片
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Time */}
          <div className="text-sm text-gray-500 mb-2">
            {formatTimeDisplay(meal.eaten_at)}
          </div>

          {/* Price */}
          {meal.price > 0 && (
            <div className="text-lg font-semibold text-teal-600 mb-2">
              ¥{meal.price.toFixed(2)}
            </div>
          )}

          {/* Description */}
          {meal.content && (
            <p className="text-gray-900 text-base sm:text-lg font-medium mb-3 line-clamp-2">
              {meal.content}
            </p>
          )}

          {/* Tags */}
          {meal.tags && meal.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {meal.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Location */}
          {meal.location && (
            <div className="mt-3 text-sm text-gray-500 flex items-center gap-1">
              <span>📍</span>
              <span>{meal.location}</span>
            </div>
          )}

          {/* Edit Hint */}
          <div className="mt-3 sm:mt-4 text-xs text-gray-400">
            点击查看详情或编辑
          </div>
        </div>
      </div>
    </Link>
  );
}