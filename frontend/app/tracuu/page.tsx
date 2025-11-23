'use client';
import { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { getApiUrl } from '../../config'; // <--- Đã sửa đường dẫn chuẩn

export default function TraCuuPage() {
  const [phone, setPhone] = useState('');
  const [bookings, setBookings] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    try {
      const res = await axios.get(getApiUrl(`/my-bookings?phone=${phone}`));
      setBookings(res.data);
    } catch (error) {
      alert('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <div className="max-w-md mx-auto p-4 pt-10">
        <h1 className="text-2xl font-extrabold text-center text-blue-800 mb-6 font-sport uppercase">Tra cứu vé đặt</h1>

        <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Số điện thoại của bạn</label>
          <div className="flex gap-2">
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0909xxxxxx"
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-numbers"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 text-white font-bold px-6 rounded-xl hover:bg-blue-700 transition-all"
            >
              {loading ? '...' : 'Tìm'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {bookings && bookings.length === 0 && (
            <div className="text-center text-gray-500">Không tìm thấy vé nào với SĐT này.</div>
          )}

          {bookings?.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl ${
                ticket.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {ticket.status === 'CONFIRMED' ? 'ĐÃ DUYỆT ✅' : 'CHỜ DUYỆT ⏳'}
              </div>

              <div className="p-5">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">Mã vé</div>
                    <div className="text-xl font-extrabold text-slate-800 font-numbers tracking-wider">{ticket.bookingRef}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 font-bold uppercase">Sân</div>
                    <div className="font-bold text-blue-600">Sân {ticket.courtId}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Ngày:</span>
                    <span className="font-bold">{format(new Date(ticket.startTime), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Giờ:</span>
                    <span className="font-bold font-numbers text-blue-700">
                      {format(new Date(ticket.startTime), 'HH:mm')} - {format(new Date(ticket.endTime), 'HH:mm')}
                    </span>
                  </div>
                </div>

                {ticket.status === 'CONFIRMED' && (
                  <div className="text-center">
                    <img src={ticket.qrCodeData} alt="QR code for booking" className="w-32 h-32 mx-auto mix-blend-multiply" />
                    <p className="text-xs text-red-400 mt-2 italic">* Nhấn giữ ảnh để lưu vé</p>
                  </div>
                )}

                {ticket.status === 'PENDING' && (
                  <div className="text-center py-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-700 text-sm font-medium">
                    Đang chờ Admin xác nhận...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}