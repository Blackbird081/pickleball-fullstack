import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, set, addMinutes, isPast, isFuture } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { vi } from 'date-fns/locale';
import { getApiUrl } from '../../config';
import AdminQRModal from './AdminQRModal';
import POSModal from './POSModal'; // <--- Import Modal Gọi món

const COURTS = [{ id: 1, name: 'Sân VIP 1' }, { id: 2, name: 'Sân VIP 2' }, { id: 3, name: 'Sân 3' }, { id: 4, name: 'Sân 4' }];

export default function DashboardView() {
  // State dữ liệu
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [todayList, setTodayList] = useState<any[]>([]); // <--- Danh sách hôm nay
  
  // State công cụ khóa sân
  const [lockDate, setLockDate] = useState<Date | undefined>(new Date());
  const [lockCourt, setLockCourt] = useState(1);
  const [lockStart, setLockStart] = useState('08:00');
  const [lockDuration, setLockDuration] = useState(60);
  const [lockReason, setLockReason] = useState('Sửa sân');
  
  // State Modals
  const [approvedBooking, setApprovedBooking] = useState<any>(null);
  const [posBooking, setPosBooking] = useState<any>(null); // <--- Booking đang gọi món

  // Hàm tải dữ liệu
  const fetchData = async () => {
    try {
      const [pendingRes, todayRes] = await Promise.all([
        axios.get(getApiUrl('/admin/pending')),
        axios.get(getApiUrl('/admin/today'))
      ]);
      setPendingList(pendingRes.data);
      setTodayList(todayRes.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 30000); // Tự refresh mỗi 30s
    return () => clearInterval(interval);
  }, []);

  // Xử lý Duyệt/Hủy
  const handleAction = async (action: 'approve' | 'reject', id: number) => {
    if (!confirm(`Xác nhận ${action === 'approve' ? 'DUYỆT' : 'HỦY'}?`)) return;
    await axios.post(getApiUrl(`/${action}`), { bookingId: id });
    if (action === 'approve') {
      // Tìm booking vừa duyệt để hiện QR
      const booking = pendingList.find(b => b.id === id);
      setApprovedBooking(booking);
    }
    fetchData();
  };

  // Xử lý Khóa sân
  const handleLock = async () => {
    if (!lockDate) return;
    const [h, m] = lockStart.split(':').map(Number);
    const start = set(lockDate, { hours: h, minutes: m, seconds: 0 });
    const end = addMinutes(start, lockDuration);
    if (!confirm(`Khóa sân ${lockCourt}?`)) return;
    try {
      await axios.post(getApiUrl('/maintenance'), { courtId: lockCourt, startTime: start, endTime: end, reason: lockReason });
      alert('Đã khóa!');
      fetchData();
    } catch (e: any) { alert(e.response?.data?.message || 'Lỗi'); }
  };

  const timeOptions = [];
  for (let h = 6; h <= 22; h++) { timeOptions.push(`${h.toString().padStart(2, '0')}:00`); timeOptions.push(`${h.toString().padStart(2, '0')}:30`); }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* --- CỘT TRÁI (2 PHẦN) --- */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* 1. DANH SÁCH CHỜ DUYỆT (Màu Vàng) */}
        {pendingList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="p-4 bg-yellow-50 border-b border-yellow-100 font-bold text-yellow-800 flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
              YÊU CẦU CHỜ DUYỆT ({pendingList.length})
            </div>
            <div className="divide-y divide-yellow-50">
              {pendingList.map((b) => (
                <div key={b.id} className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <div className="font-bold text-lg">{b.customerName} <span className="text-xs bg-gray-100 px-2 py-1 rounded">{b.bookingRef}</span></div>
                    <div className="text-sm text-gray-500">{b.phoneNumber} • Sân {b.courtId}</div>
                    <div className="text-sm font-mono font-bold text-blue-600">{format(new Date(b.startTime), 'HH:mm')} ➝ {format(new Date(b.endTime), 'HH:mm')} (Ngày {format(new Date(b.startTime), 'dd/MM')})</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction('approve', b.id)} className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-green-700">DUYỆT</button>
                    <button onClick={() => handleAction('reject', b.id)} className="bg-red-100 text-red-600 px-4 py-2 rounded font-bold text-sm hover:bg-red-200">HỦY</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. DANH SÁCH KHÁCH HÔM NAY (Màu Xanh) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-blue-50 border-b border-blue-100 font-bold text-blue-800 flex justify-between items-center">
            <span>LỊCH SÂN HÔM NAY ({todayList.length})</span>
            <button onClick={fetchData} className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-50">Làm mới</button>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {todayList.length === 0 && <div className="p-8 text-center text-gray-400">Hôm nay chưa có lịch nào.</div>}
            {todayList.map((b) => {
              const isPlaying = isPast(new Date(b.startTime)) && isFuture(new Date(b.endTime));
              return (
                <div key={b.id} className={`p-4 flex flex-col sm:flex-row justify-between items-center gap-4 ${isPlaying ? 'bg-green-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold border ${isPlaying ? 'bg-green-500 text-white border-green-500' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      <span className="text-xs">SÂN</span>
                      <span className="text-lg">{b.courtId}</span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        {b.customerName}
                        {isPlaying && <span className="text-[10px] bg-green-100 text-green-700 px-2 rounded-full animate-pulse">ĐANG ĐÁ</span>}
                      </div>
                      <div className="text-sm font-mono font-bold text-blue-600">
                        {format(new Date(b.startTime), 'HH:mm')} - {format(new Date(b.endTime), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                  
                  {/* NÚT GỌI MÓN */}
                  <button 
                    onClick={() => setPosBooking(b)}
                    className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-xl font-bold hover:bg-orange-200 transition-all"
                  >
                    <span>🥤</span> Gọi món
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* --- CỘT PHẢI: CÔNG CỤ KHÓA SÂN --- */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden h-fit sticky top-24">
          <div className="p-4 bg-red-50 border-b border-red-100 font-bold text-red-800">Tạm ngừng hoạt động sân </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-center bg-gray-50 rounded-lg"><DayPicker mode="single" selected={lockDate} onSelect={setLockDate} locale={vi} /></div>
            <div className="grid grid-cols-4 gap-2">{COURTS.map(c => <button key={c.id} onClick={() => setLockCourt(c.id)} className={`py-2 text-xs font-bold rounded border ${lockCourt === c.id ? 'bg-red-600 text-white' : 'bg-white'}`}>{c.name}</button>)}</div>
            <div className="grid grid-cols-2 gap-2">
              <select 
                value={lockStart} 
                onChange={e => setLockStart(e.target.value)} 
                className="p-2 border rounded text-sm"
                aria-label="Chọn giờ bắt đầu khóa sân"
              >
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={lockDuration}
                onChange={e => setLockDuration(Number(e.target.value))}
                className="p-2 border rounded text-sm"
                aria-label="Chọn thời lượng khóa sân"
              >
                <option value={60}>1 Tiếng</option>
                <option value={120}>2 Tiếng</option>
                <option value={240}>4 Tiếng</option>
              </select>
            </div>
            <input type="text" value={lockReason} onChange={e => setLockReason(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Lý do khóa..." />
            <button onClick={handleLock} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl">KHÓA</button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {approvedBooking && <AdminQRModal data={approvedBooking} onClose={() => setApprovedBooking(null)} />}
      {posBooking && <POSModal booking={posBooking} onClose={() => setPosBooking(null)} />}

    </div>
  );
}