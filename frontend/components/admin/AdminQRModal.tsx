import React from 'react';

interface AdminQRModalProps {
  data: { 
    qrCodeData: string; 
    bookingRef: string; 
    customerName: string;
    courtId: number;
  };
  onClose: () => void;
}

export default function AdminQRModal({ data, onClose }: AdminQRModalProps) {
  
  const handleDownload = () => {
    // 1. Tạo link tải ảo
    const link = document.createElement('a');
    link.href = data.qrCodeData;
    link.download = `Ve-${data.bookingRef}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Mở thêm tab mới (Fix lỗi Zalo/iPhone chặn tải ngầm)
    const win = window.open();
    if (win) {
      win.document.write('<img src="' + data.qrCodeData + '" style="width:100%"/>');
      win.document.title = "Vé " + data.bookingRef;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl animate-scale-in">
        
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>

        <h3 className="text-xl font-extrabold text-slate-800 mb-1 font-sport">ĐÃ DUYỆT THÀNH CÔNG!</h3>
        <p className="text-sm text-slate-500 mb-4">Gửi mã QR này cho khách hàng.</p>
        
        {/* Khu vực hiển thị QR */}
        <div className="bg-white p-3 rounded-xl border-2 border-dashed border-slate-300 mb-4 inline-block shadow-sm">
          <img src={data.qrCodeData} alt="QR Code" className="w-40 h-40 mix-blend-multiply" />
          <p className="text-lg font-bold text-slate-800 mt-2 tracking-widest font-numbers">{data.bookingRef}</p>
          <p className="text-xs text-slate-500">{data.customerName} - Sân {data.courtId}</p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleDownload}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-sport transition-all shadow-lg shadow-blue-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Mở ảnh / Tải về
          </button>
          
          <button onClick={onClose} className="w-full bg-gray-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-gray-200 font-sport">
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}