import DashboardLayout from '@/components/DashboardLayout';
import SearchForm from '@/components/SearchForm';

export default function SearchPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 pt-4">
        {/* Page Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">搜索</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">查找你的饮食记录</p>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 pb-8 sm:px-6 sm:pb-12">
          <SearchForm />
        </main>
      </div>
    </DashboardLayout>
  );
}
