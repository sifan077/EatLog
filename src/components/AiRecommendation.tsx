'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { MEAL_TYPES } from '@/lib/constants';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'afternoon_snack' | 'evening_snack' | 'snack';

export default function AiRecommendation() {
  const [selectedMealType, setSelectedMealType] = useState<MealType>('dinner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  const handleGenerateRecommendation = async () => {
    setIsGenerating(true);
    setRecommendation('');

    try {
      // 获取AI推荐所需的数据
      const response = await fetch('/api/ai-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mealType: selectedMealType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendation');
      }

      // 检查是否是流式响应
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/plain')) {
        // 流式响应
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('无法读取响应流');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          setRecommendation((prev) => prev + chunk);
        }
      } else {
        // 普通JSON响应（错误情况）
        const data = await response.json();
        throw new Error(data.error || '生成推荐失败');
      }
    } catch (error) {
      console.error('Error generating recommendation:', error);
      setRecommendation('生成推荐失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const getCurrentHour = () => {
    return new Date().getHours();
  };

  // 根据当前时间自动推荐下一餐
  const getAutoSuggestedMeal = (): MealType => {
    const hour = getCurrentHour();
    if (hour >= 5 && hour < 9) return 'breakfast';
    if (hour >= 9 && hour < 14) return 'lunch';
    if (hour >= 14 && hour < 17) return 'afternoon_snack';
    if (hour >= 17 && hour < 21) return 'dinner';
    if (hour >= 21 || hour < 5) return 'evening_snack';
    return 'dinner';
  };

  return (
    <section className="mb-8 sm:mb-10">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/50 dark:border-gray-800/50 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-xl sm:text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                AI 饮食推荐
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                基于你的饮食习惯智能推荐
              </p>
            </div>
          </div>
        </div>

        {/* Meal Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            选择要推荐的餐次
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {MEAL_TYPES.map((meal) => (
              <button
                key={meal.value}
                onClick={() => setSelectedMealType(meal.value as MealType)}
                className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedMealType === meal.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <span className="text-2xl sm:text-3xl mb-1">{meal.emoji}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {meal.label}
                </span>
                {getAutoSuggestedMeal() === meal.value && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateRecommendation}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
        >
          {isGenerating ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>生成推荐中...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>生成推荐</span>
            </>
          )}
        </button>

        {/* Recommendation Result */}
        {recommendation && (
          <div className="mt-6 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  AI 推荐结果
                </h3>
                <div className="prose prose-sm prose-headings:font-semibold prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:pl-4 prose-blockquote:italic dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-hr:my-4 max-w-none text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed break-words overflow-wrap-anywhere">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {recommendation}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
