// File: src/App.jsx
import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, Settings as SettingsIcon } from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import Header from "./components/Header";
import ClassDetail from "./pages/ClassDetail";
import GroupDetail from "./pages/GroupDetail";
import CalendarPage from "./pages/CalendarPage";
import Settings from "./pages/Settings";
import Login from "./pages/Login"; 

import { checkAuth, logoutAuth } from "./services/api"; 

function App() {
  
  // --- BƯỚC 1: LOGIC BẢO VỆ CHÍNH ---
  // Vừa vào web, kiểm tra ngay xem trong máy có Token đăng nhập chưa
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());

  // Hàm xử lý khi bấm nút Đăng xuất ở Header
  const handleLogout = () => {
    logoutAuth(); // Xóa thẻ trong bộ nhớ
    setIsAuthenticated(false); // Cập nhật lại state để đá ra màn hình Login
  };

  // --- CỔNG BẢO VỆ (AUTH GATE) ---
  // NẾU CHƯA ĐĂNG NHẬP: Ẩn sạch mọi thứ (Sidebar, Header), chỉ hiện đúng trang Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // --- STYLE CHO MENU TƯƠNG TÁC ---
  // Hàm này giúp tự động kiểm tra: Nếu đang click (isActive) thì màu đỏ, nếu không thì màu xám
  const getNavStyle = ({ isActive }) => {
    return isActive 
      ? "flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-200 text-red-600 font-medium"
      : "flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-200 text-gray-600 transition-colors";
  };

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
        
        {/* CỘT TRÁI: SIDEBAR */}
        <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
          <div className="p-6">
            <h1 className="text-gray-500 font-bold text-sm tracking-wider">MENU CHÍNH</h1>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            <NavLink to="/" className={getNavStyle}>
              <LayoutDashboard size={20} />
              Bảng điều khiển
            </NavLink>
            
            <NavLink to="/classes" className={getNavStyle}>
              <Users size={20} />
              Lớp học
            </NavLink>

            <NavLink to="/calendar" className={getNavStyle}>
              <Calendar size={20} />
              Lịch làm việc
            </NavLink>

            <NavLink to="/settings" className={getNavStyle}>
              <SettingsIcon size={20} />
              Cài đặt
            </NavLink>
          </nav>
        </div>

        {/* CỘT PHẢI: NỘI DUNG CHÍNH */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Truyền hàm Logout xuống Header */}
          <Header onLogout={handleLogout} /> 

          <main className="flex-1 overflow-y-auto bg-white">
            <Routes>
              {/* Vừa đăng nhập xong, path="/" sẽ tương ứng với Bảng điều khiển */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/classes/detail/:id" element={<ClassDetail />} />
              <Route path="/groups/:groupId" element={<GroupDetail />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>

        </div>
        
      </div>
    </BrowserRouter>
  );
}

export default App;