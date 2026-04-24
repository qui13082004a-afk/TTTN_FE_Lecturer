// File: src/pages/Login.jsx
import { useState } from "react";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { loginAuth } from "../services/api"; 

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const response = await loginAuth(email, password);
    
    setIsLoading(false);

    if (response.success) {
      onLoginSuccess(); 
    } else {
      setError(response.message); 
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4">
      
      {/* Tiêu đề nằm ngoài khung */}
      <div className="text-center mb-8">
        <h1 className="text-[28px] font-bold text-[#cc0000] tracking-wide mb-1">STU TEAMWORK</h1>
        <p className="text-gray-500 text-[15px]">Hệ thống quản lý nhóm học tập</p>
      </div>

      {/* Thẻ Form Đăng Nhập */}
      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-[420px] overflow-hidden border border-gray-100">
        
        {/* Đường viền xanh đậm trên cùng */}
        <div className="h-1.5 w-full bg-[#005b52]"></div>
        
        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold text-[#002147] mb-1">Xin Chào</h2>
          <p className="text-[15px] text-gray-500 mb-8">Vui lòng nhập thông tin giảng viên</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
              <input 
                type="email" 
                placeholder="Giangvien@stu.edu.vn"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[15px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#005b52] focus:border-[#005b52] transition-all"
                required 
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[15px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#005b52] focus:border-[#005b52] transition-all"
                required 
              />
            </div>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#cc0000] hover:bg-[#a30000] text-white py-3.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 mt-4 shadow-sm"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
                <>Đăng nhập <ArrowRight size={18} strokeWidth={2.5} /></>
              )}
            </button>
          </form>

          {/* Nút Quay về */}
          <div className="mt-8">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
              <ArrowLeft size={16} /> Quay về
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}