// File: src/components/Header.jsx
import { UserCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Công cụ chuyển trang

export default function Header({ onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="h-[80px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-10">
      <h1 className="text-[22px] font-bold text-[#e60000] tracking-wide">STU TEAMWORK</h1>
      
      <div className="flex items-center gap-5 text-gray-600">
        {/* Nút User -> Bay sang trang Cài đặt */}
        <button 
          onClick={() => navigate("/settings")} 
          className="hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all"
          title="Tài khoản của tôi"
        >
          <UserCircle size={28} strokeWidth={1.5} />
        </button>
        
        {/* Nút Đăng xuất -> Gọi hàm onLogout được truyền từ App.jsx */}
        <button 
          onClick={onLogout} 
          className="hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all"
          title="Đăng xuất"
        >
          <LogOut size={28} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}