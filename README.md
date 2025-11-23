# 🎾 PICKLEBALL MANAGEMENT SYSTEM (PMS)

Hệ thống quản lý sân Pickleball toàn diện: Đặt sân, Duyệt đơn, Check-in QR, và Bán hàng (POS).

---

## 📋 1. Yêu cầu Hệ thống (Prerequisites)

Để chạy dự án, máy tính cần cài đặt:
- **Node.js**: Phiên bản v18.17.0 trở lên (Khuyên dùng v20.x LTS).
- **PostgreSQL**: Phiên bản 16.x (Nếu chạy DB local) HOẶC Tài khoản **Supabase** (Nếu chạy DB Cloud).
- **Cloudflared**: Công cụ tạo đường hầm ra Internet.
- **Git**: Để quản lý mã nguồn.
- **Trình duyệt**: Chrome/Edge/Safari.

---

## 📦 2. Danh sách Thư viện (Dependencies)

### Backend (`/backend`)
- `express`: Web Server framework.
- `prisma` & `@prisma/client`: Làm việc với Database.
- `cors`: Cho phép Frontend kết nối.
- `qrcode`: Tạo mã QR vé.
- `multer`: Xử lý upload file (ảnh menu).
- `date-fns`: Xử lý ngày tháng.
- `@supabase/supabase-js`: (Tùy chọn) Nếu upload ảnh lên Cloud.

### Frontend (`/frontend`)
- `next`: Framework React mạnh mẽ.
- `react` & `react-dom`: Thư viện UI.
- `axios`: Gọi API Backend.
- `tailwindcss`: CSS Framework (Giao diện).
- `react-day-picker`: Lịch chọn ngày.
- `html5-qrcode`: Quét mã QR bằng camera.
- `lucide-react`: Bộ icon đẹp.

---

## 🚀 3. Hướng dẫn Cài đặt & Chạy (Localhost)

### Bước 1: Khởi động Backend (Server)
1. Mở Terminal, đi vào thư mục backend:
   ```bash
   cd backend
2. Cài đặt thư viện (Lần đầu):
  npm install
3. Đồng bộ Database:
npx prisma generate
npx prisma db push
4. Chạy Server:
node src/index.js
✅ Thành công nếu thấy: Server đang chạy tại http://localhost:3000

### Bước 2: Khởi động Frontend (Giao diện)
1. Mở Terminal mới, đi vào thư mục frontend:
cd frontend
2. Cài đặt thư viện (Lần đầu):
npm install
3. Chạy Web:
npm run dev
✅ Thành công nếu thấy: Local: http://localhost:3001

🌐 4. Hướng dẫn đưa lên Internet (Cloudflare Tunnel)

Để khách hàng truy cập được từ xa:
    Mở cổng Backend (3000):

        Mở Terminal mới tại thư mục chứa cloudflared.exe.

        Chạy: .\cloudflared.exe tunnel --url http://localhost:3000

        Copy Link 1 (Ví dụ: https://backend-xyz.trycloudflare.com).

    Cập nhật Code Frontend:

        Mở file frontend/config.ts.

        Sửa dòng API_BASE_URL thành Link 1 vừa copy.

        Lưu file.

        Tắt Frontend (Ctrl+C) và chạy lại npm run dev.

    Mở cổng Frontend (3001):

        Mở Terminal mới.

        Chạy: .\cloudflared.exe tunnel --url http://localhost:3001

        Copy Link 2 (Ví dụ: https://frontend-abc.trycloudflare.com).

👉 Gửi Link 2 cho khách hàng.

💻 5. Hướng dẫn Chuyển máy (Migration Guide)

Khi muốn copy code sang máy tính khác để làm việc:
Tại máy cũ (Đóng gói):

    Xóa rác: Vào cả 2 thư mục backend và frontend, xóa các thư mục sau:

        node_modules (Rất nặng, không cần copy).

        .next (File tạm).

    Nén file: Nén toàn bộ thư mục dự án thành .zip.

    Database:

        Nếu dùng Supabase: Không cần làm gì cả (Dữ liệu nằm trên mây).

        Nếu dùng Local: Export dữ liệu ra file .sql bằng pgAdmin/TablePlus.

Tại máy mới (Bung lụa):

    Giải nén file .zip.

    Cài đặt Node.js trên máy mới.

    Mở VS Code tại thư mục dự án.

    Mở Terminal, chạy lệnh cài đặt lại thư viện:

    cd backend
    npm install

    cd ../frontend
    npm install

Cấu hình môi trường (.env):

    Kiểm tra file backend/.env.

    Nếu dùng Local DB: Sửa lại mật khẩu PostgreSQL của máy mới.

    Nếu dùng Supabase: Giữ nguyên.

Khởi chạy:

    Backend: npx prisma generate -> node src/index.js

    Frontend: npm run dev

🛠️ 6. Các lệnh thường dùng (Cheatsheet)
Tác vụ	Lệnh (Terminal)
Cài thư viện mới	npm install ten-thu-vien
Cập nhật DB khi sửa Schema	npx prisma db push
Cập nhật Client khi sửa Schema	npx prisma generate
Chạy Backend	node src/index.js
Chạy Frontend	npm run dev
Mở Tunnel	.\cloudflared.exe tunnel --url http://localhost:PORT

Developed by Tien - Tan Thuan Port @2025

# pickleball-fullstack
# pickleball-fullstack
