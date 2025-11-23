'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '../../../config'; // <--- Dùng cái này

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Sử dụng getApiUrl thay vì link cứng
      await axios.post(getApiUrl('/admin/login'), { password });
      
      localStorage.setItem('isAdmin', 'true');
      router.push('/admin');
    } catch (error) {
      alert('Sai mật khẩu!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-extrabold text-center text-slate-800 mb-6 font-sport uppercase">Admin Portal</h1>
        <input 
          type="password" 
          placeholder="Nhập mật khẩu quản trị"
          className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all">
          ĐĂNG NHẬP
        </button>
      </form>
    </div>
  );
}