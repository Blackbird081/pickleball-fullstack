import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config';

export default function MenuView() {
  const [menu, setMenu] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', type: 'drink', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // Trạng thái đang upload ảnh

  const fetchMenu = async () => {
    const res = await axios.get(getApiUrl('/menu'));
    setMenu(res.data);
  };

  useEffect(() => { fetchMenu(); }, []);

  // Xử lý chọn ảnh
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      // Gọi API upload
      const res = await axios.post(getApiUrl('/upload'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Lưu đường dẫn ảnh vào state
      setNewItem({ ...newItem, imageUrl: res.data.imageUrl });
    } catch (err) {
      alert('Lỗi upload ảnh!');
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!newItem.name || !newItem.price) return alert('Thiếu thông tin!');
    setLoading(true);
    try {
      await axios.post(getApiUrl('/menu'), newItem);
      setNewItem({ name: '', price: '', type: 'drink', imageUrl: '' });
      fetchMenu();
    } catch (e) { alert('Lỗi!'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa món này?')) return;
    await axios.delete(getApiUrl(`/menu/${id}`));
    fetchMenu();
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* FORM THÊM MÓN */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
        <h2 className="font-bold text-lg mb-4 text-slate-800 uppercase font-sport">Thêm món mới</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Khu vực Ảnh */}
          <div className="w-full md:w-1/4">
            <label className="block w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all relative overflow-hidden group">
              {newItem.imageUrl ? (
                <img src={newItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-3xl mb-2">📷</div>
                  <span className="text-xs font-bold">{uploading ? 'Đang tải...' : 'Chọn ảnh'}</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              
              {/* Nút xóa ảnh */}
              {newItem.imageUrl && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold">Đổi ảnh khác</span>
                </div>
              )}
            </label>
          </div>

          {/* Khu vực Thông tin */}
          <div className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên món</label>
              <input type="text" placeholder="VD: Nước mía siêu to" className="w-full p-3 border rounded-xl" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giá bán</label>
              <input type="number" placeholder="VD: 15000" className="w-full p-3 border rounded-xl font-mono" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phân loại</label>
              <select className="w-full p-3 border rounded-xl" value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})}>
                <option value="drink">Đồ uống</option>
                <option value="food">Đồ ăn</option>
                <option value="other">Dụng cụ / Khác</option>
              </select>
            </div>

            <div className="col-span-2 mt-2">
              <button onClick={handleAdd} disabled={loading || uploading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                {loading ? 'Đang lưu...' : 'THÊM VÀO MENU'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DANH SÁCH MÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menu.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex gap-4 items-center hover:shadow-md transition-all">
            {/* Ảnh món */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {item.type === 'drink' ? '🥤' : item.type === 'food' ? '🍜' : '🎾'}
                </div>
              )}
            </div>
            
            <div className="flex-grow">
              <div className="font-bold text-slate-800 line-clamp-1">{item.name}</div>
              <div className="text-blue-600 font-mono font-bold text-lg">{parseInt(item.price).toLocaleString()}</div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded">{item.type}</span>
                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 text-xs font-bold px-2 py-1 border border-red-100 rounded hover:bg-red-50">Xóa</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}