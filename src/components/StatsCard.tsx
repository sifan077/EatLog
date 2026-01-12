'use client';

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
}

export default function StatsCard({
  streakDays,
  recentDaysStats,
  topTags,
  priceStats,
  recentDaysPriceStats,
}: StatsCardProps) {
  // Calculate max price for scaling
  const maxPrice = recentDaysPriceStats
    ? Math.max(...recentDaysPriceStats.map((day) => day.totalPrice), 1)
    : 1;

  const formatPrice = (price: number) => {
    return price.toFixed(2);
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

      {/* Recent 7 Days Price Stats */}
      {recentDaysPriceStats && recentDaysPriceStats.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span>📈</span>
            最近 7 天花费趋势
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6">
            <svg viewBox="0 0 400 120" className="w-full h-32 sm:h-40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1="0"
                  y1={120 - ratio * 100}
                  x2="400"
                  y2={120 - ratio * 100}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-gray-300 dark:text-gray-600"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Area fill */}
              <path
                d={`M 0 120 ${recentDaysPriceStats
                  .map((day, index) => {
                    const x = (index / (recentDaysPriceStats.length - 1)) * 400;
                    const y = 120 - (day.totalPrice / maxPrice) * 100;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} L 400 120 Z`}
                fill="url(#areaGradient)"
              />

              {/* Line */}
              <path
                d={`M 0 ${120 - (recentDaysPriceStats[0].totalPrice / maxPrice) * 100} ${recentDaysPriceStats
                  .map((day, index) => {
                    const x = (index / (recentDaysPriceStats.length - 1)) * 400;
                    const y = 120 - (day.totalPrice / maxPrice) * 100;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')}`}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-lg"
              />

              {/* Data points */}
              {recentDaysPriceStats.map((day, index) => {
                const x = (index / (recentDaysPriceStats.length - 1)) * 400;
                const y = 120 - (day.totalPrice / maxPrice) * 100;
                const isToday = index === recentDaysPriceStats.length - 1;

                return (
                  <g key={day.date}>
                    {/* Outer circle for hover effect */}
                    {isToday && (
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill="#10b981"
                        fillOpacity="0.2"
                        className="animate-pulse"
                      />
                    )}
                    {/* Data point circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isToday ? 5 : 4}
                      fill={isToday ? '#10b981' : '#fff'}
                      stroke="#10b981"
                      strokeWidth={isToday ? 3 : 2}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 px-1">
              {recentDaysPriceStats.map((day, index) => {
                const isToday = index === recentDaysPriceStats.length - 1;
                return (
                  <div
                    key={day.date}
                    className={`text-xs font-medium ${
                      isToday
                        ? 'text-green-600 dark:text-green-400 font-bold'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {day.date}
                  </div>
                );
              })}
            </div>

            {/* Price labels */}
            <div className="flex justify-between mt-1 px-1">
              {recentDaysPriceStats.map((day) => (
                <div
                  key={`price-${day.date}`}
                  className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 text-center"
                >
                  {day.hasRecords ? `¥${formatPrice(day.totalPrice)}` : '-'}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
