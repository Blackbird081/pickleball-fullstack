import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config';
import { differenceInMinutes } from 'date-fns';

interface POSModalProps {
  booking: any;
  onClose: () => void;
}

export default function POSModal({ booking, onClose }: POSModalProps) {
  const [menu, setMenu] = useState<any[]>([]);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false); // Trạng thái đã thanh toán xong chưa

  // Tính tiền sân (Logic tạm tính ở Frontend để hiển thị)
  const durationMinutes = differenceInMinutes(new Date(booking.endTime), new Date(booking.startTime));
  const courtPricePerHour = 100000; // 100k/giờ
  const courtTotal = (durationMinutes / 60) * courtPricePerHour;

  // Load dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      const [menuRes, orderRes] = await Promise.all([
        axios.get(getApiUrl('/menu')),
        axios.get(getApiUrl(`/orders/${booking.id}`))
      ]);
      setMenu(menuRes.data);
      setOrder(orderRes.data);
    };
    fetchData();
  }, [booking.id]);

  const handleAddItem = async (menuItemId: number) => {
    setLoading(true);
    await axios.post(getApiUrl('/orders/add'), { bookingId: booking.id, menuItemId });
    const res = await axios.get(getApiUrl(`/orders/${booking.id}`));
    setOrder(res.data);
    setLoading(false);
  };

  const handleRemoveItem = async (orderItemId: number) => {
    setLoading(true);
    await axios.post(getApiUrl('/orders/remove'), { orderItemId });
    const res = await axios.get(getApiUrl(`/orders/${booking.id}`));
    setOrder(res.data);
    setLoading(false);
  };

  const handlePay = async () => {
    if (!confirm('Xác nhận THANH TOÁN và KẾT THÚC lượt chơi này?')) return;
    setLoading(true);
    try {
      await axios.post(getApiUrl('/orders/pay'), { bookingId: booking.id });
      setIsPaid(true); // Chuyển sang màn hình hóa đơn thành công
    } catch (e) { alert('Lỗi thanh toán'); }
    finally { setLoading(false); }
  };

  // Màn hình Hóa đơn thành công
  if (isPaid) {
    const drinkTotal = order?.totalAmount ? parseInt(order.totalAmount) : 0;
    const finalTotal = courtTotal + drinkTotal;

    return (
      <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2 font-sport">THANH TOÁN THÀNH CÔNG!</h2>
          <p className="text-slate-500 mb-6">Đã hoàn tất đơn hàng cho {booking.customerName}</p>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 text-sm">
            <div className="flex justify-between mb-2"><span>Tiền sân ({durationMinutes}p)</span> <span className="font-bold">{courtTotal.toLocaleString()} đ</span></div>
            <div className="flex justify-between mb-2"><span>Tiền nước/đồ ăn</span> <span className="font-bold">{drinkTotal.toLocaleString()} đ</span></div>
            <div className="border-t border-gray-300 my-2"></div>
            <div className="flex justify-between text-lg font-extrabold text-blue-700"><span>TỔNG CỘNG</span> <span>{finalTotal.toLocaleString()} đ</span></div>
          </div>

          <button onClick={onClose} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900">Đóng & Quay lại</button>
        </div>
      </div>
    );
  }

  // Màn hình POS chính
  return (
    <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[85vh] flex overflow-hidden shadow-2xl">
        
        {/* CỘT TRÁI: MENU */}
        <div className="w-2/3 bg-slate-50 p-6 overflow-y-auto border-r border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-800 font-sport uppercase">Menu Đồ uống</h2>
            <button onClick={onClose} className="bg-white px-4 py-2 rounded-lg border hover:bg-gray-100 font-bold text-sm">Đóng</button>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
            {menu.map((item) => (
              <button 
                key={item.id} 
                onClick={() => handleAddItem(item.id)}
                disabled={loading}
                className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all text-left group flex flex-col h-full overflow-hidden"
              >
                {/* --- SỬA ĐOẠN NÀY --- */}
                <div className="w-full aspect-square rounded-lg bg-gray-100 mb-3 overflow-hidden relative">
                   {item.imageUrl ? (
                     <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-4xl">
                       {item.type === 'drink' ? '🥤' : item.type === 'food' ? '🍜' : '🎾'}
                     </div>
                   )}
                </div>
                {/* ------------------- */}
                
                <div className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 flex-grow">{item.name}</div>
                <div className="text-blue-600 font-mono font-bold">{parseInt(item.price).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: BILL */}
        <div className="w-1/3 bg-white flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 bg-blue-50">
            <h3 className="font-bold text-blue-800 text-xs uppercase mb-1">Khách hàng</h3>
            <div className="text-lg font-bold text-slate-800">{booking.customerName}</div>
            <div className="text-sm text-slate-500">Sân {booking.courtId} • {durationMinutes} phút</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Dòng tiền sân cố định */}
            <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <div>
                <div className="font-bold text-sm text-blue-800">Tiền sân ({durationMinutes}p)</div>
                <div className="text-xs text-gray-500">Giá: {courtPricePerHour.toLocaleString()}/h</div>
              </div>
              <span className="font-mono font-bold text-blue-700">{courtTotal.toLocaleString()}</span>
            </div>

            {/* Danh sách món gọi thêm */}
            {order?.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <div className="font-bold text-sm">{item.menuItem.name}</div>
                  <div className="text-xs text-gray-500">{parseInt(item.price).toLocaleString()} x {item.quantity}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-700">{parseInt(item.amount).toLocaleString()}</span>
                  <button onClick={() => handleRemoveItem(item.id)} className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200 font-bold">-</button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-gray-500">Tiền nước</span>
              <span className="font-bold">{order?.totalAmount ? parseInt(order.totalAmount).toLocaleString() : 0}</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-xl font-extrabold text-slate-800">
              <span>TỔNG CỘNG</span>
              <span className="text-blue-600">{(courtTotal + (order?.totalAmount ? parseInt(order.totalAmount) : 0)).toLocaleString()} đ</span>
            </div>
            <button 
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all uppercase font-sport flex items-center justify-center gap-2"
            >
              {loading ? 'Đang xử lý...' : '💰 THANH TOÁN'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}