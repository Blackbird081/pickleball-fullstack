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
  const [isPaid, setIsPaid] = useState(false);
  const [endTime, setEndTime] = useState(new Date(booking.endTime));

  const durationMinutes = differenceInMinutes(new Date(endTime), new Date(booking.startTime));
  const courtPricePerHour = 100000; 
  const courtTotal = Math.round((durationMinutes / 60) * courtPricePerHour);

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

  const handleChangeTime = async (minutes: number) => {
    setLoading(true);
    try {
      const res = await axios.post(getApiUrl('/bookings/update-time'), { bookingId: booking.id, minutes });
      setEndTime(new Date(res.data.newEndTime));
    } catch (e) { alert('Lỗi cập nhật giờ'); }
    finally { setLoading(false); }
  };

  const handlePay = async () => {
    if (!confirm('Xác nhận THANH TOÁN và KẾT THÚC?')) return;
    setLoading(true);
    try {
      await axios.post(getApiUrl('/orders/pay'), { bookingId: booking.id });
      setIsPaid(true);
    } catch (e) { alert('Lỗi thanh toán'); }
    finally { setLoading(false); }
  };

  if (isPaid) {
    const drinkTotal = order?.totalAmount ? parseInt(order.totalAmount) : 0;
    return (
      <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2 font-sport">THANH TOÁN THÀNH CÔNG!</h2>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 text-sm">
            <div className="flex justify-between mb-2"><span>Tiền sân ({durationMinutes}p)</span> <span className="font-bold">{courtTotal.toLocaleString()} đ</span></div>
            <div className="flex justify-between mb-2"><span>Tiền nước</span> <span className="font-bold">{drinkTotal.toLocaleString()} đ</span></div>
            <div className="border-t border-gray-300 my-2"></div>
            <div className="flex justify-between text-lg font-extrabold text-blue-700"><span>TỔNG CỘNG</span> <span>{(courtTotal + drinkTotal).toLocaleString()} đ</span></div>
          </div>
          <button onClick={onClose} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900">Đóng & Quay lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[85vh] flex overflow-hidden shadow-2xl">
        <div className="w-2/3 bg-slate-50 p-6 overflow-y-auto border-r border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-800 font-sport uppercase">Menu Đồ uống</h2>
            <button onClick={onClose} className="bg-white px-4 py-2 rounded-lg border hover:bg-gray-100 font-bold text-sm">Đóng</button>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
            {menu.map((item) => (
              <button key={item.id} onClick={() => handleAddItem(item.id)} disabled={loading} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all text-left group flex flex-col h-full">
                <div className="text-4xl mb-3 text-center">{item.type === 'drink' ? '🥤' : '🍜'}</div>
                <div className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 grow">{item.name}</div>
                <div className="text-blue-600 font-mono font-bold">{parseInt(item.price).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-1/3 bg-white flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 bg-blue-50">
            <h3 className="font-bold text-blue-800 text-xs uppercase mb-1">Khách hàng</h3>
            <div className="text-lg font-bold text-slate-800">{booking.customerName}</div>
            <div className="text-sm text-slate-500">Sân {booking.courtId}</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold text-sm text-blue-800">Tiền sân ({durationMinutes}p)</div>
                <span className="font-mono font-bold text-blue-700">{courtTotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between bg-white p-1 rounded border border-blue-200">
                <button onClick={() => handleChangeTime(-15)} disabled={loading} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold">-15p</button>
                <span className="text-xs font-bold text-gray-500">Chỉnh giờ</span>
                <button onClick={() => handleChangeTime(15)} disabled={loading} className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-bold">+15p</button>
              </div>
            </div>

            {order?.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="grow">
                  <div className="font-bold text-sm text-slate-800">{item.menuItem.name}</div>
                  <div className="text-xs text-gray-500">{parseInt(item.price).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200">
                  <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 font-bold px-1">-</button>
                  <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                  <button onClick={() => handleAddItem(item.menuItem.id)} className="text-blue-500 font-bold px-1">+</button>
                </div>
                <div className="w-16 text-right font-mono font-bold text-slate-700 text-sm">{parseInt(item.amount).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-6 text-xl font-extrabold text-slate-800">
              <span>TỔNG</span>
              <span className="text-blue-600">{(courtTotal + (order?.totalAmount ? parseInt(order.totalAmount) : 0)).toLocaleString()} đ</span>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-100 text-sm">LƯU TẠM</button>
              <button onClick={handlePay} disabled={loading} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 text-sm">THANH TOÁN</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}