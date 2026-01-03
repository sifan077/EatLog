'use client';

import { NutritionAnalysis } from '@/lib/types';

interface NutritionCardProps {
  analysis: NutritionAnalysis;
}

export default function NutritionCard({ analysis }: NutritionCardProps) {
  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/50 dark:border-gray-800/50 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <span>📊</span>
        今日营养分析
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
            {analysis.totalCalories}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">卡路里</div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-1">
            {analysis.mealCount}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">餐次</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            {analysis.averageCaloriesPerMeal}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">平均/餐</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
            {analysis.totalProtein}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">蛋白质(g)</div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span>💡</span>
          饮食建议
        </h3>

        {analysis.recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            暂无建议，继续保持！
          </div>
        ) : (
          <div className="space-y-3">
            {analysis.recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`flex items-start gap-3 p-4 rounded-xl transition-colors duration-200 ${
                  rec.category === 'warning'
                    ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
                    : rec.category === 'meal'
                      ? 'bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800'
                      : 'bg-cyan-50 dark:bg-cyan-900/20 border-2 border-cyan-200 dark:border-cyan-800'
                }`}
              >
                <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${
                    rec.category === 'warning'
                      ? 'text-red-700 dark:text-red-400'
                      : rec.category === 'meal'
                        ? 'text-teal-700 dark:text-teal-400'
                        : 'text-cyan-700 dark:text-cyan-400'
                  }`}>
                    {rec.title}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {rec.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}