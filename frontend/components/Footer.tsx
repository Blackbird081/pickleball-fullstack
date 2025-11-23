import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-slate-600 text-sm font-medium">Hệ thống đặt sân Pickleball trực tuyến</p>
          <div className="w-12 h-1 bg-blue-600 rounded-full opacity-20 my-1"></div>
          <p className="text-slate-400 text-xs font-mono tracking-wide">Developed by: <span className="text-blue-700 font-bold">Tien - Tan Thuan Port</span> @2025</p>
        </div>
      </div>
    </footer>
  );
}