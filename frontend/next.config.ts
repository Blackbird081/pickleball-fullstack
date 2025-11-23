/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Xuất ra file tĩnh cho GitHub Pages
  images: {
    unoptimized: true, // Tắt tối ưu ảnh server-side
  },
  // Bỏ comment dòng dưới nếu bạn deploy vào thư mục con (ví dụ: ten-ban.github.io/pickleball)
  // basePath: '/pickleball', 
};

export default nextConfig;