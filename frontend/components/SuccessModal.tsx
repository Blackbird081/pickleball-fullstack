import React from 'react';

interface SuccessModalProps {
  data: { qrCodeData: string; bookingRef: string };
  onClose: () => void;
}

export default function SuccessModal({ data, onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl animate-scale-in">
        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-yellow-100">
          <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-800 mb-2 font-sport">ĐÃ GỬI YÊU CẦU!</h3>
        <p className="text-slate-500 mb-6 font-medium text-sm">
          Yêu cầu đặt sân <span className="font-bold text-slate-800">{data.bookingRef}</span> đang chờ Admin xác nhận.
        </p>
        <div className="space-y-3">
          <a href={`https://zalo.me/0901380807?text=${encodeURIComponent(`Xin chào, tôi vừa đặt sân mã ${data.bookingRef}.`)}`} target="_blank" rel="noreferrer" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-sport transition-all shadow-lg shadow-blue-200">
            Thông báo Admin qua Zalo
          </a>
          <button onClick={onClose} className="w-full bg-gray-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-gray-200 font-sport">Đóng</button>
        </div>
      </div>
    </div>
  );
}