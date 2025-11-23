import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // TẮT CÁC LUẬT KHÓ TÍNH
    rules: {
      "@typescript-eslint/no-explicit-any": "off",       // Cho phép dùng 'any'
      "@typescript-eslint/no-unsafe-member-access": "off", // Cho phép truy cập .response thoải mái
      "@typescript-eslint/no-unused-vars": "off",        // Khai báo biến không dùng cũng không sao
      "@typescript-eslint/ban-ts-comment": "off"         // Cho phép dùng comment ignore
    },
  },
];

export default eslintConfig;