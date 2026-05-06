## Công nghệ sử dụng

Dự án được phát triển dựa trên các công nghệ hiện đại:

* **Framework**: React 19 (`^19.2.4`).
* **Build Tool**: Vite 8 (`^8.0.4`).
* **Styling**: Tailwind CSS 3 (`^3.4.19`).
* **Routing**: React Router 7 (`^7.14.0`).
* **HTTP Client**: Axios.
* **Icons**: Lucide React.

## Hướng dẫn cài đặt

1. Cài đặt các gói phụ thuộc:
```bash
   npm install
   ```
2. Chạy môi trường phát triển (Development):
```bash
   npm run dev
   ```
3. Xây dựng dự án (Build for Production):
```bash
   npm run build
   ```
4. Kiểm tra lỗi mã (Linting):
```bash
   npm run lint
   ```

## Cấu trúc thư mục chính
* ```/src/pages```: Chứa các trang giao diện chính (Login, Dashboard, Classes...).

* ```/src/assets```: Lưu trữ hình ảnh và tài nguyên tĩnh.

* ```/src/components```: Chứa các UI Component dùng chung (Header, Modals...).

* ```/src/services```: Chứa cấu hình gọi API kết nối với Backend.
  
* `App.jsx` & `main.jsx` : Các file gốc để khởi tạo ứng dụng.
  
* ```vite.config.js```: Cấu hình cho Vite, bao gồm các plugin cho React và Tailwind.

