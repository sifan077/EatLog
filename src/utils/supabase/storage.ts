import { STORAGE_BUCKET } from '@/lib/constants';

// Generate a unique file path for a meal photo
export function generatePhotoPath(userId: string, fileExtension: string = 'jpg'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}/${timestamp}_${random}.${fileExtension}`;
}

// Get the public URL for a photo (if bucket is public)
export function getPhotoPublicUrl(photoPath: string): string {
  return `${STORAGE_BUCKET}/${photoPath}`;
}

// Extract file extension from file name
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1]?.toLowerCase() || 'jpg' : 'jpg';
}

// Validate file type (only allow images)
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

// Validate file size (max 10MB)
export function isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
