// File: src/components/CreateReportModal.jsx
import { useState, useEffect } from "react";
import { X, Calendar, FileText, Loader2 } from "lucide-react";

export default function CreateReportModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ title: "", deadline: "", description: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [minDateTime, setMinDateTime] = useState("");

  // Tự động tính toán ngày giờ hiện tại để chặn chọn ngày trong quá khứ
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMinDateTime(now.toISOString().slice(0, 16)); // Định dạng YYYY-MM-DDThh:mm
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.deadline) {
      alert("Vui lòng nhập Tên báo cáo và Hạn nộp!");
      return;
    }

    // ĐẶC TẢ: Chặn tuyệt đối việc nộp deadline trong quá khứ
    const selectedDate = new Date(formData.deadline);
    const currentDate = new Date();
    if (selectedDate <= currentDate) {
      alert("Lỗi: Hạn nộp báo cáo phải lớn hơn thời gian hiện tại!");
      return;
    }

    setIsLoading(true);
    await onSubmit(formData);
    setIsLoading(false);
    setFormData({ title: "", deadline: "", description: "" });
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-red-600" /> Giao yêu cầu báo cáo
          </h3>
          <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Tên báo cáo / Cột mốc</label>
            <input 
              type="text" placeholder="VD: Báo cáo tiến độ Tuần 3" 
              value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={inputClass} autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar size={16}/> Hạn chót nộp bài (Deadline)</label>
            <input 
              type="datetime-local" 
              min={minDateTime} // CHẶN LỊCH QUÁ KHỨ Ở ĐÂY
              value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              className={inputClass} 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Yêu cầu chi tiết (Tùy chọn)</label>
            <textarea 
              rows="3" placeholder="Ghi chú thêm yêu cầu cho sinh viên..." 
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`${inputClass} resize-none`} 
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-colors">Hủy</button>
            <button type="submit" disabled={isLoading} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2">
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Tạo yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}