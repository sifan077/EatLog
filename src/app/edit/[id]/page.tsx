import { getMealLogById } from '../../actions';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import EditForm from '@/components/EditForm';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-white/50">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">请先登录</h2>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-600 transition-all duration-200"
          >
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  let meal = null;
  let error = null;

  try {
    meal = await getMealLogById(id);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch meal log';
  }

  if (!meal) {
    notFound();
  }

  // Check if the meal belongs to the current user
  if (meal.user_id !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-white/50">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">无权访问</h2>
          <p className="text-gray-600 mb-6">您没有权限查看这条记录</p>
          <Link
            href="/today"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-600 transition-all duration-200"
          >
            返回今日记录
          </Link>
        </div>
      </div>
    );
  }

  // Get signed URLs for all photos
  const photoUrls = await Promise.all(
    meal.photo_paths.map(async (photoPath) => {
      try {
        const { data, error: urlError } = await supabase.storage
          .from('meal-photos')
          .createSignedUrl(photoPath, 60 * 60 * 24); // 24 hours expiry

        if (urlError) {
          console.error('Failed to create signed URL:', urlError);
          return null;
        }

        return data?.signedUrl || null;
      } catch (err) {
        console.error('Error creating signed URLs:', err);
        return null;
      }
    })
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 pt-4">
        {/* Page Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
          <Link
            href="/today"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span className="text-2xl">←</span>
            <span className="font-medium">返回今日记录</span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4">编辑记录</h2>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 pb-8 sm:px-6 sm:pb-12">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <EditForm meal={meal} photoUrls={photoUrls} />
        </main>
      </div>
    </DashboardLayout>
  );
}
