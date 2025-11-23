import type { Metadata } from "next";
import { Inter, Montserrat, Poppins } from "next/font/google";
import "./globals.css";

// 1. Font cho nội dung chính (Body) - Sạch, dễ đọc
const inter = Inter({ 
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

// 2. Font cho Tiêu đề (Headings) - Mạnh mẽ, thể thao
const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800"], // Chỉ lấy nét đậm
  variable: "--font-montserrat",
  display: "swap",
});

// 3. Font cho Số (Numbers) - Tròn trịa, hiện đại
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pickleball Booking VN",
  description: "Hệ thống đặt sân Pickleball chuyên nghiệp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${montserrat.variable} ${poppins.variable} antialiased bg-gray-50 text-slate-900 font-sans`}>
        {children}
      </body>
    </html>
  );
}