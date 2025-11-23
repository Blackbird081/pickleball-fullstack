const express = require('express');
const cors = require('cors');

// 1. Import các file quản lý đường dẫn
const clientRoutes = require('./routes/client.routes');
const adminRoutes = require('./routes/admin.routes');
const menuRoutes = require('./routes/menu.routes');   // <--- MỚI THÊM
const orderRoutes = require('./routes/order.routes'); // <--- MỚI THÊM
const reportRoutes = require('./routes/report.routes');

// Khởi tạo server

const app = express();
const PORT = 3000;

// Cho phép tất cả các nơi gọi vào (Dễ nhất để fix lỗi CORS)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());


const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// 1. Cấu hình Supabase (Lấy thông tin từ Dashboard)
// Bạn cần thêm 2 dòng này vào file .env:
// SUPABASE_URL="https://xyz.supabase.co"
// SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." (Lấy cái anon key)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 2. Cấu hình Multer (Chỉ dùng bộ nhớ tạm, không lưu file)
const upload = multer({ storage: multer.memoryStorage() });

// 3. API Upload ảnh lên Supabase
app.post('/api/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false });

    try {
        const file = req.file;
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;

        // Upload lên Supabase Storage
        const { data, error } = await supabase
            .storage
            .from('menu-images') // Tên bucket bạn vừa tạo
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) throw error;

        // Lấy link ảnh công khai
        const { data: publicUrlData } = supabase
            .storage
            .from('menu-images')
            .getPublicUrl(fileName);

        res.json({ success: true, imageUrl: publicUrlData.publicUrl });
    } catch (error) {
        console.error('Upload lỗi:', error);
        res.status(500).json({ success: false, message: 'Lỗi upload lên Cloud' });
    }
});

// 2. API Upload ảnh
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Chưa chọn file!' });
    }
    // Trả về đường dẫn ảnh (tương đối với thư mục public của frontend)
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
});

// 2. Đăng ký sử dụng các đường dẫn đó
app.use('/api', clientRoutes);
app.use('/api', adminRoutes);
app.use('/api', menuRoutes);   // <--- MỚI THÊM (Sửa lỗi Menu trống)
app.use('/api', orderRoutes);  // <--- MỚI THÊM (Sửa lỗi Thanh toán)
app.use('/api', reportRoutes); // <--- MỚI THÊM (Báo cáo)

// API Test
app.get('/', (req, res) => {
    res.send('Pickleball Server is Running Full Options!');
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});