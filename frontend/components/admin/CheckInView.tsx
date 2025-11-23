import React, { useState } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { getApiUrl } from '../../config';

export default function CheckInView() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const html5QrCode = new Html5Qrcode("reader-hidden");
    setMessage(null); setScanResult(null);
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      handleCheckIn(decodedText);
    } catch (err) { setMessage({ text: 'Không tìm thấy QR!', type: 'error' }); }
  };

  const handleCheckIn = async (qrDataString: string) => {
    try {
      const qrData = JSON.parse(qrDataString);
      setScanResult(qrData.ref);
      const res = await axios.post(getApiUrl('/checkin'), { bookingRef: qrData.ref });
      setMessage({ text: `HỢP LỆ! Khách: ${res.data.data.customer} - Sân ${res.data.data.court}`, type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Vé không hợp lệ!', type: 'error' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-gray-200 shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">SOÁT VÉ</h2>
        {!scanResult && (
          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <p className="mb-2 text-sm text-gray-500"><span className="font-bold">Bấm để chọn ảnh QR</span></p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        )}
        {scanResult && (
          <div className="animate-scale-in">
            <p className="text-gray-400 mb-2">Mã vé:</p>
            <p className="font-mono text-2xl font-bold text-slate-800 mb-6 bg-gray-100 py-2 rounded-lg">{scanResult}</p>
            <div className={`text-lg font-bold p-6 rounded-xl mb-6 text-white ${message?.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{message?.text}</div>
            <button onClick={() => { setScanResult(null); setMessage(null); }} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl">Kiểm tra vé khác</button>
          </div>
        )}
        <div id="reader-hidden" className="hidden"></div>
      </div>
    </div>
  );
}