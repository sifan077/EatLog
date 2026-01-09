'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MealLog } from '@/lib/types';
import MealCard from './MealCard';

export default function SearchForm() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrlsMap, setPhotoUrlsMap] = useState<Map<string, (string | null)[]>>(new Map());
  const supabase = createClient();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query.trim());
      } else {
        setResults([]);
        setPhotoUrlsMap(new Map());
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: searchError } = await supabase
        .from('meal_logs')
        .select('*')
        .or(`content.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
        .order('eaten_at', { ascending: false })
        .limit(50); // Limit to 50 results

      if (searchError) {
        throw searchError;
      }

      setResults(data || []);

      // Get signed URLs for all photos
      const urlsMap = new Map<string, (string | null)[]>();
      await Promise.all(
        (data || []).map(async (meal) => {
          try {
            const photoUrls = await Promise.all(
              meal.photo_paths.map(async (photoPath: string) => {
                const { data, error: urlError } = await supabase.storage
                  .from('meal-photos')
                  .createSignedUrl(photoPath, 60 * 60 * 24);

                if (urlError) {
                  console.error('Failed to create signed URL:', urlError);
                  return null;
                }

                return data?.signedUrl || null;
              })
            );

            urlsMap.set(meal.id, photoUrls);
          } catch (err) {
            console.error('Error creating signed URLs:', err);
            urlsMap.set(
              meal.id,
              meal.photo_paths.map(() => null)
            );
          }
        })
      );

      setPhotoUrlsMap(urlsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 border border-white/50 dark:border-gray-800/50 transition-colors duration-300"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400 dark:text-gray-500 text-xl">🔍</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索描述、地点、标签..."
            className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all duration-200 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="animate-spin text-xl">⏳</div>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">搜索描述、地点或标签内容</p>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!query && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 sm:p-12 text-center border border-white/50 dark:border-gray-800/50 transition-colors duration-300">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            搜索记录
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            输入关键词搜索你的饮食记录
          </p>
        </div>
      )}

      {/* No Results */}
      {query && !loading && results.length === 0 && !error && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 sm:p-12 text-center border border-white/50 dark:border-gray-800/50 transition-colors duration-300">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            没有找到结果
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">试试其他关键词</p>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              搜索结果
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {results.length} 条记录
            </span>
          </div>
          {results.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              photoUrls={photoUrlsMap.get(meal.id) || meal.photo_paths.map(() => null)}
              returnUrl="/search"
            />
          ))}
        </div>
      )}
    </div>
  );
}
