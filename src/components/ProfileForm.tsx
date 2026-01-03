'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/app/actions';
import { UserProfile, UserProfileInput } from '@/lib/types';
import {
  ACTIVITY_LEVELS,
  DIET_GOALS,
  DIETARY_RESTRICTIONS,
  COMMON_ALLERGIES,
} from '@/lib/constants';

interface ProfileFormProps {
  profile: UserProfile | null;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(!profile); // 如果没有profile，默认编辑模式

  // Form state
  const [formData, setFormData] = useState<UserProfileInput>({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    height: profile?.height || undefined,
    weight: profile?.weight || undefined,
    activity_level: profile?.activity_level || undefined,
    diet_goals: profile?.diet_goals || [],
    dietary_restrictions: profile?.dietary_restrictions || [],
    allergies: profile?.allergies || [],
    daily_calorie_target: profile?.daily_calorie_target || undefined,
  });

  // Separate tag input states for each field
  const [dietGoalsInput, setDietGoalsInput] = useState('');
  const [dietaryRestrictionsInput, setDietaryRestrictionsInput] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');

  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [activeTagField, setActiveTagField] = useState<
    'diet_goals' | 'dietary_restrictions' | 'allergies'
  >('diet_goals');

  const handleInputChange = (field: keyof UserProfileInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (tag: string, field: keyof UserProfileInput) => {
    const tags = (formData[field] as string[]) || [];
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...tags, trimmedTag],
      }));
    }
    // Clear the appropriate input based on field
    if (field === 'diet_goals') setDietGoalsInput('');
    else if (field === 'dietary_restrictions') setDietaryRestrictionsInput('');
    else if (field === 'allergies') setAllergiesInput('');
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tag: string, field: keyof UserProfileInput) => {
    const tags = (formData[field] as string[]) || [];
    setFormData((prev) => ({
      ...prev,
      [field]: tags.filter((t) => t !== tag),
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent, field: keyof UserProfileInput) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      let inputValue = '';
      if (field === 'diet_goals') inputValue = dietGoalsInput;
      else if (field === 'dietary_restrictions') inputValue = dietaryRestrictionsInput;
      else if (field === 'allergies') inputValue = allergiesInput;
      handleAddTag(inputValue, field);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUserProfile(formData);
      setSuccess(true);
      setIsEditing(false); // Switch to view mode after saving
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const getTagSuggestions = (field: keyof UserProfileInput) => {
    const currentTags = (formData[field] as string[]) || [];
    let suggestions: string[] = [];
    let inputValue = '';

    if (field === 'diet_goals') {
      suggestions = DIET_GOALS.filter((tag) => !currentTags.includes(tag));
      inputValue = dietGoalsInput;
    } else if (field === 'dietary_restrictions') {
      suggestions = DIETARY_RESTRICTIONS.filter((tag) => !currentTags.includes(tag));
      inputValue = dietaryRestrictionsInput;
    } else if (field === 'allergies') {
      suggestions = COMMON_ALLERGIES.filter((tag) => !currentTags.includes(tag));
      inputValue = allergiesInput;
    }

    return suggestions.filter((tag) => tag.toLowerCase().includes(inputValue.toLowerCase()));
  };

  return (
    <form onSubmit={isEditing ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2">
          <span>✅</span>
          <span>保存成功！</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/50 dark:border-gray-800/50 transition-colors duration-300">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">基本信息</h3>

        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label
              htmlFor="display_name"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              显示名称
            </label>
            <input
              id="display_name"
              type="text"
              value={formData.display_name || ''}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              disabled={loading || !isEditing}
              maxLength={50}
              placeholder="你的昵称"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              个人简介
            </label>
            <textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={loading || !isEditing}
              rows={3}
              maxLength={200}
              placeholder="简单介绍一下自己..."
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
              {(formData.bio || '').length}/200
            </div>
          </div>

          {/* Birth Date */}
          <div>
            <label
              htmlFor="birth_date"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              生日
            </label>
            <input
              id="birth_date"
              type="date"
              value={profile?.birth_date?.split('T')[0] || ''}
              onChange={(e) => handleInputChange('birth_date', e.target.value)}
              disabled={loading || !isEditing}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Health Information */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/50 dark:border-gray-800/50 transition-colors duration-300">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">健康信息</h3>

        <div className="space-y-4">
          {/* Height */}
          <div>
            <label
              htmlFor="height"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              身高 (cm)
            </label>
            <input
              id="height"
              type="number"
              value={formData.height || ''}
              onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || undefined)}
              disabled={loading || !isEditing}
              min="100"
              max="250"
              step="0.1"
              placeholder="例如：175"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Weight */}
          <div>
            <label
              htmlFor="weight"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              体重 (kg)
            </label>
            <input
              id="weight"
              type="number"
              value={formData.weight || ''}
              onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || undefined)}
              disabled={loading || !isEditing}
              min="30"
              max="200"
              step="0.1"
              placeholder="例如：70"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              活动水平
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleInputChange('activity_level', level.value)}
                  disabled={loading || !isEditing}
                  className={`px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    formData.activity_level === level.value
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <div className="font-medium">{level.label}</div>
                  <div className="text-xs mt-1 opacity-80">{level.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Calorie Target */}
          <div>
            <label
              htmlFor="daily_calorie_target"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              每日卡路里目标
            </label>
            <input
              id="daily_calorie_target"
              type="number"
              value={formData.daily_calorie_target || ''}
              onChange={(e) =>
                handleInputChange('daily_calorie_target', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              disabled={loading || !isEditing}
              min="1000"
              max="5000"
              placeholder="例如：2000"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">可选，用于饮食推荐</p>
          </div>
        </div>
      </div>

      {/* Diet Preferences */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/50 dark:border-gray-800/50 transition-colors duration-300">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">饮食偏好</h3>

        <div className="space-y-6">
          {/* Diet Goals */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              饮食目标
            </label>
            <div className="relative">
              <input
                type="text"
                value={dietGoalsInput}
                onChange={(e) => {
                  setDietGoalsInput(e.target.value);
                  setActiveTagField('diet_goals');
                  setShowTagSuggestions(true);
                }}
                onKeyDown={(e) => handleTagInputKeyDown(e, 'diet_goals')}
                onFocus={() => {
                  setActiveTagField('diet_goals');
                  setShowTagSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                disabled={loading || !isEditing}
                placeholder="添加饮食目标..."
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              {showTagSuggestions &&
                activeTagField === 'diet_goals' &&
                dietGoalsInput &&
                getTagSuggestions('diet_goals').length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {getTagSuggestions('diet_goals').map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag, 'diet_goals')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.diet_goals?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-sm font-medium rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag, 'diet_goals')}
                    disabled={loading || !isEditing}
                    className="ml-2 text-teal-500 hover:text-teal-700 dark:hover:text-teal-300 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {/* Quick Select */}
            {isEditing && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">快速选择：</p>
                <div className="flex flex-wrap gap-2">
                  {DIET_GOALS.filter((tag) => !formData.diet_goals?.includes(tag)).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag, 'diet_goals')}
                      disabled={loading}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-400 transition-colors disabled:cursor-not-allowed"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              饮食限制
            </label>
            <div className="relative">
              <input
                type="text"
                value={dietaryRestrictionsInput}
                onChange={(e) => {
                  setDietaryRestrictionsInput(e.target.value);
                  setActiveTagField('dietary_restrictions');
                  setShowTagSuggestions(true);
                }}
                onKeyDown={(e) => handleTagInputKeyDown(e, 'dietary_restrictions')}
                onFocus={() => {
                  setActiveTagField('dietary_restrictions');
                  setShowTagSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                disabled={loading || !isEditing}
                placeholder="添加饮食限制..."
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              {showTagSuggestions &&
                activeTagField === 'dietary_restrictions' &&
                dietaryRestrictionsInput &&
                getTagSuggestions('dietary_restrictions').length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {getTagSuggestions('dietary_restrictions').map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag, 'dietary_restrictions')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.dietary_restrictions?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-medium rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag, 'dietary_restrictions')}
                    disabled={loading || !isEditing}
                    className="ml-2 text-orange-500 hover:text-orange-700 dark:hover:text-orange-300 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {/* Quick Select */}
            {isEditing && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">快速选择：</p>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_RESTRICTIONS.filter(
                    (tag) => !formData.dietary_restrictions?.includes(tag)
                  ).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag, 'dietary_restrictions')}
                      disabled={loading}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-700 dark:hover:text-orange-400 transition-colors disabled:cursor-not-allowed"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              过敏信息
            </label>
            <div className="relative">
              <input
                type="text"
                value={allergiesInput}
                onChange={(e) => {
                  setAllergiesInput(e.target.value);
                  setActiveTagField('allergies');
                  setShowTagSuggestions(true);
                }}
                onKeyDown={(e) => handleTagInputKeyDown(e, 'allergies')}
                onFocus={() => {
                  setActiveTagField('allergies');
                  setShowTagSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                disabled={loading || !isEditing}
                placeholder="添加过敏信息..."
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              {showTagSuggestions &&
                activeTagField === 'allergies' &&
                allergiesInput &&
                getTagSuggestions('allergies').length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {getTagSuggestions('allergies').map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag, 'allergies')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.allergies?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag, 'allergies')}
                    disabled={loading || !isEditing}
                    className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-300 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {/* Quick Select */}
            {isEditing && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">快速选择：</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ALLERGIES.filter((tag) => !formData.allergies?.includes(tag)).map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag, 'allergies')}
                        disabled={loading}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 transition-colors disabled:cursor-not-allowed"
                      >
                        + {tag}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                // Reset form to original profile data
                setFormData({
                  display_name: profile?.display_name || '',
                  bio: profile?.bio || '',
                  height: profile?.height || undefined,
                  weight: profile?.weight || undefined,
                  activity_level: profile?.activity_level || undefined,
                  diet_goals: profile?.diet_goals || [],
                  dietary_restrictions: profile?.dietary_restrictions || [],
                  allergies: profile?.allergies || [],
                  daily_calorie_target: profile?.daily_calorie_target || undefined,
                });
                setDietGoalsInput('');
                setDietaryRestrictionsInput('');
                setAllergiesInput('');
              }}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 disabled:cursor-not-allowed transition-all duration-200"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-200 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            编辑
          </button>
        )}
      </div>
    </form>
  );
}
