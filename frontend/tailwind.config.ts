import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Chỉ định các file cần áp dụng Tailwind
    "./app/**/*.{js,ts,jsx,tsx,mdx}", 
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Cấu hình Font chữ mới tại đây
      fontFamily: {
        sans: ['var(--font-inter)'],       // Font mặc định (Inter)
        sport: ['var(--font-montserrat)'], // Font tiêu đề (Montserrat)
        numbers: ['var(--font-poppins)'],  // Font số (Poppins)
      },
      // Cấu hình màu sắc (giữ nguyên mặc định của Next.js)
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // Cấu hình hiệu ứng chuyển động (Animation)
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      }
    },
  },
  plugins: [],
};
export default config;