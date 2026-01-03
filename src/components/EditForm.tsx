'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { MEAL_TYPES, TAG_SUGGESTIONS } from '@/lib/constants';
import { MealLog } from '@/lib/types';
import { formatDateTimeDisplay } from '@/utils/date';
import { generatePhotoPath, isValidImageFile, isValidFileSize } from '@/utils/supabase/storage';

interface EditFormProps {
  meal: MealLog;
  photoUrls: (string | null)[];
}

export default function EditForm({ meal, photoUrls: initialPhotoUrls }: EditFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [content, setContent] = useState(meal.content || '');
  const [mealType, setMealType] = useState(meal.meal_type);
  const [eatenAt, setEatenAt] = useState(meal.eaten_at.slice(0, 16)); // Format for datetime-local input
  const [location, setLocation] = useState(meal.location || '');
  const [price, setPrice] = useState(meal.price > 0 ? meal.price.toString() : '');
  const [tags, setTags] = useState<string[]>(meal.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Photo state
  const [existingPhotoPaths, setExistingPhotoPaths] = useState<string[]>(meal.photo_paths);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<(string | null)[]>(initialPhotoUrls);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [photoErrors, setPhotoErrors] = useState<Set<number>>(new Set());

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const compressImage = (
    file: File,
    maxWidth: number = 1280,
    quality: number = 0.6
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    try {
      const newPhotosList: File[] = [];
      const newPreviewsList: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!isValidImageFile(file)) {
          setError(`文件 "${file.name}" 不是有效的图片格式`);
          return;
        }

        if (!isValidFileSize(file, 10)) {
          setError(`文件 "${file.name}" 大小超过 10MB`);
          return;
        }

        const compressedFile = await compressImage(file, 1280, 0.6);
        newPhotosList.push(compressedFile);

        const reader = new FileReader();
        const preview = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(compressedFile);
        });
        newPreviewsList.push(preview);
      }

      setNewPhotos([...newPhotos, ...newPhotosList]);
      setNewPhotoPreviews([...newPhotoPreviews, ...newPreviewsList]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片处理失败');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveExistingPhoto = (index: number) => {
    const newPaths = existingPhotoPaths.filter((_, i) => i !== index);
    const newUrls = existingPhotoUrls.filter((_, i) => i !== index);
    setExistingPhotoPaths(newPaths);
    setExistingPhotoUrls(newUrls);
  };

  const handleRemoveNewPhoto = (index: number) => {
    const newPhotosList = newPhotos.filter((_, i) => i !== index);
    const newPreviewsList = newPhotoPreviews.filter((_, i) => i !== index);
    setNewPhotos(newPhotosList);
    setNewPhotoPreviews(newPreviewsList);
  };

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('未登录，请重新登录');
      }

      // Upload new photos
      const newPhotoPaths: string[] = [];
      for (let i = 0; i < newPhotos.length; i++) {
        const photo = newPhotos[i];
        const photoPath = generatePhotoPath(user.id, photo.name.split('.').pop() || 'jpg');
        const { error: uploadError } = await supabase.storage
          .from('meal-photos')
          .upload(photoPath, photo);

        if (uploadError) {
          throw new Error(`照片上传失败 (${i + 1}/${newPhotos.length}): ${uploadError.message}`);
        }

        newPhotoPaths.push(photoPath);
      }

      // Combine all photo paths
      const allPhotoPaths = [...existingPhotoPaths, ...newPhotoPaths];

      // Update meal log
      const { error: updateError } = await supabase
        .from('meal_logs')
        .update({
          content: content.trim() || null,
          meal_type: mealType,
          eaten_at: new Date(eatenAt).toISOString(),
          location: location.trim() || null,
          price: price ? parseFloat(price) : 0,
          tags: tags.length > 0 ? tags : null,
          photo_paths: allPhotoPaths,
          updated_at: new Date().toISOString(),
        })
        .eq('id', meal.id);

      if (updateError) {
        throw new Error(`更新失败: ${updateError.message}`);
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      // Delete all photos from storage
      if (existingPhotoPaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('meal-photos')
          .remove(existingPhotoPaths);

        if (storageError) {
          console.error('Storage error:', storageError);
        }
      }

      // Delete record from database
      const { error: deleteError } = await supabase.from('meal_logs').delete().eq('id', meal.id);

      if (deleteError) {
        throw new Error(`删除失败: ${deleteError.message}`);
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const filteredTagSuggestions = TAG_SUGGESTIONS.filter(
    (tag) => !tags.includes(tag) && tag.toLowerCase().includes(tagInput.toLowerCase())
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/50"
    >
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">编辑记录</h3>

      {/* Photos Section */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">照片</label>

        {/* Existing Photos */}
        {existingPhotoUrls.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
            {existingPhotoUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative group">
                {url && !photoErrors.has(index) ? (
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-28 sm:h-32 object-cover rounded-lg"
                    onError={() => setPhotoErrors((prev) => new Set([...prev, index]))}
                  />
                ) : (
                  <div className="w-full h-28 sm:h-32 flex items-center justify-center bg-gray-100 rounded-lg">
                    <span className="text-3xl">🍽️</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveExistingPhoto(index)}
                  disabled={loading}
                  className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New Photos */}
        {newPhotoPreviews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
            {newPhotoPreviews.map((preview, index) => (
              <div key={`new-${index}`} className="relative group">
                <img
                  src={preview}
                  alt={`New photo ${index + 1}`}
                  className="w-full h-28 sm:h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveNewPhoto(index)}
                  disabled={loading}
                  className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 hover:bg-gray-50 transition-all duration-200"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
            className="hidden"
            disabled={loading}
          />
          <div className="text-4xl mb-2">📸</div>
          <p className="text-gray-700 font-medium">添加更多照片</p>
          <p className="text-sm text-gray-500 mt-1">支持 JPG、PNG、GIF、WebP，最大 10MB</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-6">
        <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
          描述
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          rows={3}
          maxLength={200}
          placeholder="简单描述一下这顿饭..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 resize-none"
        />
        <div className="text-right text-xs text-gray-500 mt-1">{content.length}/200</div>
      </div>

      {/* Meal Type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">餐次</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
          {MEAL_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setMealType(type.value)}
              disabled={loading}
              className={`px-3 py-3 sm:px-4 sm:py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                mealType === type.value
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:cursor-not-allowed`}
            >
              <div className="text-lg sm:text-xl mb-1">{type.emoji}</div>
              <div className="text-xs">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div className="mb-6">
        <label htmlFor="eatenAt" className="block text-sm font-semibold text-gray-700 mb-2">
          进餐时间
        </label>
        <input
          id="eatenAt"
          type="datetime-local"
          value={eatenAt}
          onChange={(e) => setEatenAt(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
        />
      </div>

      {/* Price */}
      <div className="mb-6">
        <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
          价格
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400 font-medium">¥</span>
          </div>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">可选，默认为 0</p>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
          地点
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={loading}
          maxLength={100}
          placeholder="例如：家里、公司、餐厅..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
        />
        <div className="text-right text-xs text-gray-500 mt-1">{location.length}/100</div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">标签</label>
        <div className="relative">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              setShowTagSuggestions(true);
            }}
            onKeyDown={handleTagInputKeyDown}
            onFocus={() => setShowTagSuggestions(true)}
            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
            disabled={loading || tags.length >= 10}
            placeholder="添加标签..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
          />
          {showTagSuggestions && tagInput && filteredTagSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filteredTagSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    handleAddTag(tag);
                    setShowTagSuggestions(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-700 text-sm font-medium rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  disabled={loading}
                  className="ml-2 text-teal-500 hover:text-teal-700 disabled:cursor-not-allowed"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2">{tags.length}/10 个标签</div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-3 sm:py-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              保存中...
            </span>
          ) : (
            '保存更改'
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading}
          className="px-6 py-3 sm:py-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
        >
          删除
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h4 className="text-xl font-semibold text-gray-900 mb-4">确认删除</h4>
            <p className="text-gray-600 mb-6">确定要删除这条记录吗？此操作无法撤销。</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:cursor-not-allowed transition-all duration-200"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:bg-red-300 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    删除中...
                  </span>
                ) : (
                  '确认删除'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
