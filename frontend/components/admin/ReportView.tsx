import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function ReportView() {
  const [summary, setSummary] = useState<any>(null);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, topRes, chartRes] = await Promise.all([
        axios.get(getApiUrl(`/reports/summary?from=${fromDate}T00:00:00.000Z&to=${toDate}T23:59:59.999Z`)),
        axios.get(getApiUrl('/reports/top-players')),
        axios.get(getApiUrl('/reports/chart'))
      ]);
      setSummary(sumRes.data);
      setTopPlayers(topRes.data);
      setChartData(chartRes.data);
    } catch (err) { 
      console.error(err);
      setError('Không kết nối được Server báo cáo.');
      // Tạo dữ liệu giả để không bị trắng trang
      setSummary({ totalRevenue: 0, totalBookings: 0, totalCourtRevenue: 0, totalDrinkRevenue: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Hàm format hiển thị ngày Việt Nam
  const formatDateVN = (dateString: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      
      {/* THANH CÔNG CỤ LỌC */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="font-bold text-lg text-slate-800 font-sport uppercase">Báo cáo doanh thu</h2>
        
        <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
          
          {/* Từ ngày */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase px-1">Từ ngày</span>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                aria-label="Từ ngày"
                value={fromDate} 
                onChange={e => setFromDate(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-sm font-mono"
              />
              {/* Hiển thị ngày VN */}
              <span className="text-xs font-bold text-blue-600 hidden md:block">{formatDateVN(fromDate)}</span>
            </div>
          </div>

          <span className="text-gray-400 font-bold">➝</span>

          {/* Đến ngày */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase px-1">Đến ngày</span>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                aria-label="Đến ngày"
                value={toDate} 
                onChange={e => setToDate(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-sm font-mono"
              />
              {/* Hiển thị ngày VN */}
              <span className="text-xs font-bold text-blue-600 hidden md:block">{formatDateVN(toDate)}</span>
            </div>
          </div>

          <button 
            onClick={fetchData}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 ml-2 transition-all h-full"
          >
            {loading ? '...' : 'XEM'}
          </button>
        </div>
      </div>

      {/* THÔNG BÁO LỖI (NẾU CÓ) */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center font-bold">
          ⚠️ {error} (Hãy kiểm tra lại Backend)
        </div>
      )}

      {/* NỘI DUNG BÁO CÁO */}
      {!summary ? (
        <div className="p-20 text-center text-gray-400 animate-pulse">Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* 1. THẺ TỔNG QUAN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
              <div className="text-sm font-bold text-gray-400 uppercase mb-1">Tổng Doanh Thu</div>
              <div className="text-3xl font-extrabold text-blue-700 font-mono">
                {summary.totalRevenue?.toLocaleString()} đ
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Sân: {summary.totalCourtRevenue?.toLocaleString()} - Nước: {summary.totalDrinkRevenue?.toLocaleString()}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
              <div className="text-sm font-bold text-gray-400 uppercase mb-1">Lượt khách đã chơi</div>
              <div className="text-3xl font-extrabold text-green-600 font-numbers">
                {summary.totalBookings}
              </div>
              <div className="text-xs text-gray-500 mt-2">Trong khoảng thời gian này</div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
              <div className="text-sm font-bold text-gray-400 uppercase mb-1">Khách VIP nhất</div>
              <div className="text-xl font-bold text-purple-700 truncate">
                {topPlayers[0]?.customerName || 'Chưa có'}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {topPlayers[0]?._count.id || 0} lần đặt sân
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2. BIỂU ĐỒ */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg text-slate-800 mb-6 font-sport">SỐ LƯỢNG KHÁCH 7 NGÀY QUA</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. TOP KHÁCH HÀNG */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg text-slate-800 mb-4 font-sport">TOP 5 KHÁCH VIP</h3>
              <div className="space-y-4">
                {topPlayers.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${idx === 0 ? 'bg-yellow-400' : 'bg-slate-300'}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-800">{p.customerName}</div>
                        <div className="text-xs text-gray-500">{p.phoneNumber}</div>
                      </div>
                    </div>
                    <div className="text-blue-600 font-bold font-numbers">{p._count.id} <span className="text-xs text-gray-400 font-normal">lần</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}