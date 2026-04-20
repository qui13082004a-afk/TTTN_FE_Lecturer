// File: src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { User, Save, ShieldCheck, AlertCircle } from "lucide-react";
import { fetchUserProfile, updateUserProfile, changePassword, logoutAuth } from "../services/api";

export default function Settings() {
  const [profile, setProfile] = useState({ name: "", email: "", faculty: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passErrors, setPassErrors] = useState({});

  useEffect(() => {
    fetchUserProfile().then(setProfile);
  }, []);

  const handleSaveProfile = async () => {
    if (!profile.name.trim() || !profile.faculty.trim()) {
      alert("Họ tên và Khoa không được để trống!");
      return;
    }
    
    const res = await updateUserProfile(profile);
    
    if (res.success) {
      alert(res.message);
      // Có thể reload trang để Header cập nhật lại tên mới ngay lập tức
      window.location.reload();
    } else {
      alert(res.message);
    }
  };

  const handleChangePass = async () => {
    let errors = {};
    setPassErrors({});

    // 1. Kiểm tra validation phía Giao diện (Frontend)
    if (passwords.new.length < 6) {
      errors.new = "Mật khẩu mới phải có ít nhất 6 ký tự";
    } else if (passwords.new === passwords.current) {
      errors.new = "Mật khẩu mới không được trùng với mật khẩu cũ"; 
    }
    if (passwords.confirm !== passwords.new) {
      errors.confirm = "Mật khẩu nhập lại không khớp";
    }

    if (Object.keys(errors).length > 0) {
      setPassErrors(errors);
      return;
    }

    // 2. Giao tiếp với API
    // Chúng ta phải bọc các biến này lại cho đúng tên mà api.js đang chờ (currentPassword, newPassword...)
    const payloadForAPI = {
      currentPassword: passwords.current,
      newPassword: passwords.new,
      confirmPassword: passwords.confirm
    };

    const res = await changePassword(payloadForAPI);
    
    // 3. Xử lý kết quả trả về từ Backend
    if (res.success) {
      alert(res.message); // Hiển thị câu: "Đổi mật khẩu thành công..."
      
      // Nếu Backend có gửi cờ forceLogout = true
      if (res.forceLogout) {
        logoutAuth(); 
        window.location.reload(); 
      } else {
        // Dự phòng: Lỡ Backend không gửi cờ forceLogout, ta vẫn tự động reset form
        setPasswords({ current: "", new: "", confirm: "" });
      }
    } else {
      // Backend báo lỗi (Ví dụ: Sai mật khẩu hiện tại)
      alert(res.message); 
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="p-8 h-full bg-gray-50/50">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Cài đặt tài khoản</h2>
        <p className="text-gray-500 text-sm mt-1">Quản lý thông tin cá nhân và bảo mật của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1100px] items-start">
        
        {/* KHỐI TRÁI: HỒ SƠ CÁ NHÂN */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col h-full min-h-[480px]">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Hồ sơ cá nhân</h3>
              <p className="text-sm text-gray-500">Cập nhật thông tin hiển thị của bạn</p>
            </div>
          </div>
          
          <div className="space-y-5 flex-1">
            <div>
              <label className={labelClass}>Họ và tên</label>
              <input 
                type="text" value={profile.name} 
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className={inputClass} 
              />
            </div>
            <div>
              <label className={labelClass}>Địa chỉ Email</label>
              <input 
                type="email" value={profile.email} 
                readOnly 
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] text-gray-500 cursor-not-allowed select-none" 
              />
            </div>
            <div>
              <label className={labelClass}>Khoa trực thuộc</label>
              <input 
                type="text" value={profile.faculty} 
                onChange={(e) => setProfile({...profile, faculty: e.target.value})}
                className={inputClass} 
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSaveProfile}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Save size={18} /> Lưu thay đổi
            </button>
          </div>
        </div>

        {/* KHỐI PHẢI: ĐỔI MẬT KHẨU */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col h-full min-h-[480px]">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Bảo mật</h3>
              <p className="text-sm text-gray-500">Đảm bảo tài khoản của bạn luôn an toàn</p>
            </div>
          </div>
          
          <div className="space-y-5 flex-1">
            <div>
              <label className={labelClass}>Mật khẩu hiện tại</label>
              <input 
                type="password" placeholder="••••••••" 
                value={passwords.current}
                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                className={inputClass} 
              />
            </div>
            <div>
              <label className={labelClass}>Mật khẩu mới</label>
              <input 
                type="password" placeholder="••••••••" 
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                className={`w-full bg-gray-50 border ${passErrors.new ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-[15px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all`} 
              />
              {passErrors.new && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={14}/> {passErrors.new}</p>}
            </div>
            <div>
              <label className={labelClass}>Xác nhận mật khẩu mới</label>
              <input 
                type="password" placeholder="••••••••" 
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                className={`w-full bg-gray-50 border ${passErrors.confirm ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-[15px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all`} 
              />
              {passErrors.confirm && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={14}/> {passErrors.confirm}</p>}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleChangePass}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <ShieldCheck size={18} /> Cập nhật mật khẩu
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}