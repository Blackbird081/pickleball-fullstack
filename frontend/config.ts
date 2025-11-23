// frontend/config.ts

// 👇 Dùng link này để chạy trên máy tính của bạn
// export const API_BASE_URL = 'http://localhost:3000'; 

// (Comment dòng Cloudflare lại để dành khi nào cần thì mở ra)
export const API_BASE_URL = 'https://honolulu-singing-signatures-premier.trycloudflare.com';

export const getApiUrl = (endpoint: string) => {
  const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${cleanBaseUrl}/api/${cleanEndpoint}`;
};