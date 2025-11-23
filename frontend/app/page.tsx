'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format, addMinutes, set } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
// Import các mảnh ghép
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Timeline from '@/components/Timeline';
import SuccessModal from '@/components/SuccessModal';

// 👇 QUAN TRỌNG: Import hàm lấy link từ file config chung
import { getApiUrl } from '../config'; 

const COURTS_CONFIG = [
  { id: 1, name: 'Sân VIP 1 (Trong nhà)', type: 'Indoor' },
  { id: 2, name: 'Sân VIP 2 (Trong nhà)', type: 'Indoor' },
  { id: 3, name: 'Sân 3 (Ngoài trời)', type: 'Outdoor' },
  { id: 4, name: 'Sân 4 (Ngoài trời)', type: 'Outdoor' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'booking' | 'vip'>('booking');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCourt, setSelectedCourt] = useState(COURTS_CONFIG[0].id);
  const [bookings, setBookings] = useState<any[]>([]);
  
  const [startHour, setStartHour] = useState('17:00');
  const [duration, setDuration] = useState(60);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [successData, setSuccessData] = useState<any>(null);

  const fetchBookings = useCallback(async () => {
    if (!selectedDate) return;
    setBookings([]); 
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      // 👇 SỬA: Dùng getApiUrl thay vì biến cứng
      const res = await axios.get(getApiUrl(`/bookings?date=${dateStr}&courtId=${selectedCourt}`));
      setBookings(res.data);
    } catch (error) { console.error(error); }
  }, [selectedDate, selectedCourt]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleBooking = async () => {
    if (!formData.name || !formData.phone || !selectedDate) return alert('Thiếu thông tin!');
    const [h, m] = startHour.split(':').map(Number);
    const startTime = set(selectedDate, { hours: h, minutes: m, seconds: 0 });
    const endTime = addMinutes(startTime, duration);

    try {
      // 👇 SỬA: Dùng getApiUrl
      const res = await axios.post(getApiUrl('/bookings'), {
        courtId: selectedCourt,
        customerName: formData.name,
        phoneNumber: formData.phone,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      if (res.data.success) {
        setSuccessData(res.data.data);
        fetchBookings();
        setFormData({ name: '', phone: '' });
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi đặt sân!');
    }
  };

  const timeOptions = [];
  for (let h = 6; h <= 22; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 22 && m > 0) break;
      timeOptions.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  const checkConflict = () => {
    if (!selectedDate) return false;
    const [h, m] = startHour.split(':').map(Number);
    const start = set(selectedDate, { hours: h, minutes: m }).getTime();
    const end = addMinutes(start, duration).getTime();
    return bookings.some(b => {
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return start < bEnd && end > bStart;
    });
  };

  const currentCourt = COURTS_CONFIG.find(c => c.id === selectedCourt);
  const css = `.rdp { margin: 0; --rdp-cell-size: 40px; } .rdp-day_selected:not([disabled]) { background-color: #2563eb; font-weight: bold; } .rdp-caption_label { font-family: var(--font-montserrat); font-weight: 700; color: #1e293b; }`;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 flex flex-col">
      <style>{css}</style>
      <Header />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex gap-6">
          <button onClick={() => setActiveTab('booking')} className={`py-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-all ${activeTab === 'booking' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Đặt sân linh hoạt</button>
          <button onClick={() => setActiveTab('vip')} className={`py-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-all ${activeTab === 'vip' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Đăng ký VIP</button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 md:p-8 w-full flex-grow">
        {activeTab === 'booking' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 space-y-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 font-sport">1. Chọn ngày</h2>
                <div className="flex justify-center"><DayPicker mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={vi} disabled={{ before: new Date() }} /></div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 font-sport">2. Chọn sân</h2>
                <div className="space-y-3">
                  {COURTS_CONFIG.map((court) => (
                    <button key={court.id} onClick={() => setSelectedCourt(court.id)} className={`w-full text-left p-4 rounded-xl transition-all border flex justify-between items-center ${selectedCourt === court.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-100 hover:border-blue-300'}`}>
                      <div><div className={`font-bold text-sm ${selectedCourt === court.id ? 'text-blue-700' : 'text-slate-700'} font-sport`}>{court.name}</div><div className="text-xs text-gray-400 mt-1 font-medium">{court.type}</div></div>
                      {selectedCourt === court.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-8">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-extrabold text-slate-800 font-sport tracking-tight mb-6">Đặt sân: <span className="text-blue-600">{currentCourt?.name}</span></h2>
                
                <Timeline bookings={bookings} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="startHour" className="block text-sm font-bold text-slate-700 mb-2">Giờ bắt đầu</label>
                    <select
                      id="startHour"
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-numbers text-lg"
                    >
                      {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Thời lượng</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setDuration(d => Math.max(15, d - 15))} className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold">-</button>
                      <div className="flex-1 text-center p-3 border border-gray-300 rounded-xl font-numbers text-lg font-bold bg-gray-50">{duration} phút</div>
                      <button onClick={() => setDuration(d => d + 15)} className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold">+</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <input type="text" placeholder="Tên của bạn" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  <input type="tel" placeholder="Số điện thoại (Zalo)" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-numbers" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>

                {checkConflict() ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-bold text-center">❌ Khung giờ này đã bị trùng</div>
                ) : (
                  <button onClick={handleBooking} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-sport uppercase tracking-wide">Xác nhận</button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vip' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-4 font-sport">ĐĂNG KÝ THÀNH VIÊN VIP</h2>
            <p className="text-slate-600 mb-8">Liên hệ đăng ký lịch cố định.</p>
            <a href="https://zalo.me/0901380807" target="_blank" rel="noopener" className="inline-flex items-center bg-yellow-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-200">Zalo</a>
          </div>
        )}

        {successData && <SuccessModal data={successData} onClose={() => setSuccessData(null)} />}
      </main>
      <Footer />
    </div>
  );
}