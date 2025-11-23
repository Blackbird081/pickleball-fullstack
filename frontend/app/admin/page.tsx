'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardView from '@/components/admin/DashboardView';
import CheckInView from '@/components/admin/CheckInView';
import MenuView from '@/components/admin/MenuView'; // <--- Import mới
import ReportView from '@/components/admin/ReportView';

export default function AdminPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checkin' | 'menu' | 'report'>('dashboard');

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) router.push('/admin/login');
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold font-sport tracking-wider">ADMIN PORTAL</h1>
          <button onClick={handleLogout} className="text-xs font-bold bg-red-600 px-3 py-1 rounded hover:bg-red-700">Đăng xuất</button>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex">
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide border-b-4 transition-all ${activeTab === 'dashboard' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>📊 Quản lý</button>
          <button onClick={() => setActiveTab('checkin')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide border-b-4 transition-all ${activeTab === 'checkin' ? 'border-green-600 text-green-600 bg-green-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>📷 Soát vé</button>
          <button onClick={() => setActiveTab('menu')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide border-b-4 transition-all ${activeTab === 'menu' ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>🍔 Menu & Giá</button>
          <button onClick={() => setActiveTab('report')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide border-b-4 transition-all ${activeTab === 'report' ? 'border-purple-500 text-purple-600 bg-purple-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>📈 Báo cáo</button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'checkin' && <CheckInView />}
        {activeTab === 'menu' && <MenuView />}
        {activeTab === 'report' && <ReportView />}
      </main>
    </div>
  );
}