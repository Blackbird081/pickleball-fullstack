import React from 'react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold font-sport text-xl shadow-blue-200 shadow-lg">P</div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tighter font-sport hidden md:block">PICKLEBALL TAN THUAN</h1>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tighter font-sport md:hidden">PKB TAN THUAN</h1>
        </div>
        <div className="flex gap-2">
            <a href="/tracuu" className="text-xs font-bold text-slate-600 hover:text-blue-600 font-sport border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all">🔍 Tra cứu</a>
            <a href="https://zalo.me/0901380807" target="_blank" rel="noreferrer noopener" className="text-xs font-bold text-blue-600 hover:text-blue-800 font-sport border border-blue-100 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all">💬 Hỗ trợ</a>
        </div>
      </div>
    </header>
  );
}