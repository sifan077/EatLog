'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface StatsCardProps {
  streakDays: number;
  recentDaysStats: Array<{ date: string; mealCount: number; hasRecords: boolean }>;
  topTags: Array<{ tag: string; count: number }>;
  priceStats?: {
    todayTotal: number;
    weekTotal: number;
    monthTotal: number;
    averageDaily: number;
  };
  recentDaysPriceStats?: Array<{ date: string; totalPrice: number; hasRecords: boolean }>;
  recentWeeksPriceStats?: Array<{ date: string; totalPrice: number; hasRecords: boolean }>;
  monthlyPriceStats?: Array<{ date: string; totalPrice: number; hasRecords: boolean }>;
}

type TimeRange = '7days' | '4weeks' | 'year';

export default function StatsCard({
  streakDays,
  recentDaysStats,
  topTags,
  priceStats,
  recentDaysPriceStats,
  recentWeeksPriceStats,
  monthlyPriceStats,
}: StatsCardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  // Get chart data based on selected time range
  const getChartData = () => {
    switch (timeRange) {
      case '7days':
        return recentDaysPriceStats || [];
      case '4weeks':
        return recentWeeksPriceStats || [];
      case 'year':
        return monthlyPriceStats || [];
      default:
        return recentDaysPriceStats || [];
    }
  };

  const chartData = getChartData();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            ¥{formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/50 dark:border-gray-800/50 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <span>📊</span>
        饮食统计
      </h2>

      {/* Streak Days */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 text-center border-2 border-orange-200 dark:border-orange-900/30">
          <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-2">
            {streakDays}
          </div>
          <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
            连续记录天数
          </div>
          {streakDays > 0 && (
            <div className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-500">
              🔥 继续保持！
            </div>
          )}
        </div>
      </div>

      {/* Price Statistics */}
      {priceStats && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span>💰</span>
            花费统计
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 text-center border border-green-200 dark:border-green-900/30">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                ¥{formatPrice(priceStats.todayTotal)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                今日花费
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-900/30">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                ¥{formatPrice(priceStats.weekTotal)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                本周花费
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-900/30">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                ¥{formatPrice(priceStats.monthTotal)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                本月花费
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 text-center border border-amber-200 dark:border-amber-900/30">
              <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                ¥{formatPrice(priceStats.averageDaily)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                日均花费
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Trend Chart */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>📈</span>
            花费趋势
          </h3>

          {/* Time Range Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                timeRange === '7days'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              最近7天
            </button>
            <button
              onClick={() => setTimeRange('4weeks')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                timeRange === '4weeks'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              最近4周
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                timeRange === 'year'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              今年
            </button>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-300 dark:text-gray-600"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="currentColor"
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="currentColor"
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `¥${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="totalPrice"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Tags */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span>🏷️</span>
          热门标签
        </h3>
        {topTags.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
            添加标签后这里会显示热门内容
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topTags.map((item, index) => (
              <div
                key={item.tag}
                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-full border border-teal-200 dark:border-teal-800/30"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.tag}
                </span>
                <span className="ml-2 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/50 px-1.5 py-0.5 rounded-full">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
