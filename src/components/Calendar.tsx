'use client';

import { useState, useEffect } from 'react';
import { MealLog } from '@/lib/types';
import { formatDateDisplay, isSameDay } from '@/utils/date';
import MealCard from './MealCard';

interface CalendarProps {
  mealLogs: MealLog[];
  photoUrlsMap: Map<string, (string | null)[]>;
}

export default function Calendar({ mealLogs, photoUrlsMap }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    return { daysInMonth, startDayOfWeek };
  };

  // Get meal logs for a specific date
  const getMealLogsForDate = (date: Date) => {
    return mealLogs.filter((meal) => isSameDay(meal.eaten_at, date));
  };

  // Check if a date has meal logs
  const hasMealLogs = (date: Date) => {
    return mealLogs.some((meal) => isSameDay(meal.eaten_at, date));
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const { daysInMonth, startDayOfWeek } = getDaysInMonth(currentDate);
  const monthNames = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  // Generate calendar days
  const calendarDays = [];
  // Empty cells for days before the first day of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }

  const selectedMealLogs = selectedDate ? getMealLogsForDate(selectedDate) : [];
  const isToday = (date: Date) => isSameDay(date, new Date());
  const isSelected = (date: Date) => selectedDate && isSameDay(date, selectedDate);

  return (
    <div className="space-y-6">
      {/* Calendar Grid */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 border border-white/50 dark:border-gray-800/50 transition-colors duration-300">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Previous month"
          >
            <svg
              className="w-5 h-5 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
            </h2>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Next month"
          >
            <svg
              className="w-5 h-5 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Today Button */}
        <div className="mb-4">
          <button
            onClick={goToToday}
            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-teal-600 transition-all duration-200"
          >
            返回今日
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const hasLogs = hasMealLogs(date);
            const today = isToday(date);
            const selected = isSelected(date);

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 relative ${
                  selected
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg scale-105'
                    : today
                      ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-sm sm:text-base">{date.getDate()}</span>
                {hasLogs && (
                  <div
                    className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                      selected ? 'bg-white' : 'bg-teal-500 dark:bg-teal-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Meal Logs */}
      {selectedDate && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 border border-white/50 dark:border-gray-800/50 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              {formatDateDisplay(selectedDate)}
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">{selectedMealLogs.length} 条记录</span>
          </div>

          {selectedMealLogs.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-5xl mb-3">🍽️</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">这一天没有记录</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {selectedMealLogs.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  photoUrls={photoUrlsMap.get(meal.id) || meal.photo_paths.map(() => null)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
