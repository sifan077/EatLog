'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MEAL_TYPES } from '@/lib/constants';
import { detectMealType } from '@/utils/date';
import { generatePhotoPath, isValidImageFile, isValidFileSize } from '@/utils/supabase/storage';

export default function QuickRecordForm() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [mealType, setMealType] = useState(detectMealType());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const compressImage = (file: File, maxWidth: number = 1280, quality: number = 0.6): Promise<File> => {
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

          // Calculate new dimensions
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
      const newPhotos: File[] = [];
      const newPreviews: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!isValidImageFile(file)) {
          setError(`文件 "${file.name}" 不是有效的图片格式`);
          return;
        }

        // Validate file size (max 10MB)
        if (!isValidFileSize(file, 10)) {
          setError(`文件 "${file.name}" 大小超过 10MB`);
          return;
        }

        // Compress image
        const compressedFile = await compressImage(file, 1280, 0.6);
        newPhotos.push(compressedFile);

        // Create preview
        const reader = new FileReader();
        const preview = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(compressedFile);
        });
        newPreviews.push(preview);
      }

      setPhotos([...photos, ...newPhotos]);
      setPhotoPreviews([...photoPreviews, ...newPreviews]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片处理失败');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (photos.length === 0) {
        throw new Error('请至少选择一张照片');
      }

      // Get user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('未登录，请重新登录');
      }

      // Upload all photos to storage
      const photoPaths: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const photoPath = generatePhotoPath(user.id, photo.name.split('.').pop() || 'jpg');
        const { error: uploadError } = await supabase.storage
          .from('meal-photos')
          .upload(photoPath, photo);

        if (uploadError) {
          throw new Error(`照片上传失败 (${i + 1}/${photos.length}): ${uploadError.message}`);
        }

        photoPaths.push(photoPath);
      }

      // Create meal log record
      const { error: insertError } = await supabase.from('meal_logs').insert({
        user_id: user.id,
        photo_paths: photoPaths,
        content: content.trim() || null,
        meal_type: mealType,
        eaten_at: new Date().toISOString(),
      });

      if (insertError) {
        throw new Error(`记录创建失败: ${insertError.message}`);
      }

      // Reset form
      setPhotos([]);
      setPhotoPreviews([]);
      setContent('');
      setMealType(detectMealType());
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload page to show new record
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : '记录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/50">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
        快速记录
      </h3>

      {/* Photo Upload */}

              <div className="mb-6">

                <label className="block text-sm font-semibold text-gray-700 mb-2">

                  照片 <span className="text-red-500">*</span>

                </label>

      

                {/* Photo Previews */}

                {photoPreviews.length > 0 && (

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">

                    {photoPreviews.map((preview, index) => (

                      <div key={index} className="relative group">

                        <img

                          src={preview}

                          alt={`Preview ${index + 1}`}

                          className="w-full h-32 sm:h-40 object-cover rounded-lg"

                        />

                        <button

                          type="button"

                          onClick={() => handleRemovePhoto(index)}

                          disabled={loading}

                          className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"

                        >

                          ×

                        </button>

                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">

                          {photos[index] && `${(photos[index].size / 1024).toFixed(1)} KB`}

                        </div>

                      </div>

                    ))}

                  </div>

                )}

      

                {/* Upload Button */}

                <div

                  className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${

                    photoPreviews.length > 0

                      ? 'border-teal-400 bg-teal-50'

                      : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'

                  }`}

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

      

                  <div>

                    <div className="text-4xl sm:text-5xl mb-3">📸</div>

                    <p className="text-gray-700 font-medium">

                      {photoPreviews.length > 0 ? '继续添加照片' : '点击上传照片'}

                    </p>

                    <p className="text-sm text-gray-500 mt-1">

                      支持 JPG、PNG、GIF、WebP，最大 10MB，可多选

                    </p>

                  </div>

                </div>

              </div>      {/* Content */}
      <div className="mb-6">
        <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
          描述
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          rows={2}
          maxLength={200}
          placeholder="简单描述一下这顿饭..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 resize-none"
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {content.length}/200
        </div>
      </div>

      {/* Meal Type */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  餐次 <span className="text-red-500">*</span>
                </label>
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
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || photos.length === 0}
        className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-3 sm:py-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            记录中...
          </span>
        ) : (
          '记录'
        )}
      </button>
    </form>
  );
}