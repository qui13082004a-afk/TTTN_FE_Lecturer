// File: src/components/CreateClassModal.jsx
import { useState } from "react";
import { X, AlertCircle, Loader2, Minus, Plus } from "lucide-react";

export default function CreateClassModal({ isOpen, onClose, onSubmit }) {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    semester: "HK2_2025_2026", // Mặc định học kì này
    studentCount: 40,
    groupCount: 8,
    startDate: new Date().toISOString().split('T')[0],
    endDate: ""
  });

  if (!isOpen) return null;

  const validate = () => {
    let newErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (formData.title.trim().length < 5) newErrors.title = "Tên môn học phải có ít nhất 5 ký tự";
    if (formData.studentCount <= 0) newErrors.studentCount = "Số sinh viên phải lớn hơn 0";
    if (formData.groupCount > formData.studentCount) newErrors.groupCount = "Số nhóm không được lớn hơn sinh viên";
    if (formData.startDate < today) newErrors.startDate = "Ngày bắt đầu không được nhỏ hơn ngày hiện tại";
    if (formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "Hạn chót không được trước ngày bắt đầu";
    }
    if (!formData.endDate) newErrors.endDate = "Vui lòng chọn hạn chót";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Kiểm tra lỗi trước khi gửi (giữ nguyên logic của bạn)
    const isValid = validate();
    if (!isValid) return;

    onSubmit({
      title: formData.title,             
      semester: formData.semester,       
      maxStudents: formData.studentCount,
      maxGroups: formData.groupCount,    
      deadline: formData.endDate         
    });
  };

  const handleClose = () => {
    setErrors({});
    setFormData({
      title: "",
      semester: "HK2 25-26",
      studentCount: 40,
      groupCount: 8,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ""
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">Tạo lớp học mới</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Hàng 1: Tên môn học (2/3) + Học kì (1/3) */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Tên môn học (kèm Nhóm/Ca)</label>
              <input
                type="text"
                placeholder="VD: Kiểm thử - Ca 1"
                className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 bg-gray-50/50`}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.title}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Học kì</label>
              <select
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 bg-gray-50/50 text-gray-800"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              >
                <option value="HK2 25-26">HK2 25-26</option>
                <option value="HK1 25-26">HK1 25-26</option>
                <option value="HK3 24-25">HK3 24-25</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Ngày bắt đầu</label>
              <input type="date" className={`w-full border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-2 focus:outline-none focus:border-red-500 text-sm`} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}/>
              {errors.startDate && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Hạn chót đăng ký</label>
              <input type="date" className={`w-full border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-2 focus:outline-none focus:border-red-500 text-sm`} value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}/>
              {errors.endDate && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.endDate}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={handleClose} className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"> Hủy </button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Xác nhận tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}