// File: src/components/AddStudentToGroupModal.jsx
import { useState } from "react";
import { X, UserPlus, AlertCircle, Loader2 } from "lucide-react";

export default function AddStudentToGroupModal({ isOpen, onClose, studentInfo, groups = [] }) {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !studentInfo) return null;

  // LOGIC ĐẶC TẢ CỰC QUAN TRỌNG: Lọc ra danh sách nhóm đang "thiếu người"
  const availableGroups = groups.filter(group => group.currentCount < group.maxCount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedGroupId) return;

    setLoading(true);
    // Giả lập thời gian gọi API gán nhóm
    setTimeout(() => {
      setLoading(false);
      alert(`Đã thêm sinh viên ${studentInfo.name} vào nhóm thành công!`);
      setSelectedGroupId("");
      onClose();
    }, 800);
  };

  const handleClose = () => {
    setSelectedGroupId("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <UserPlus size={22} className="text-red-600" />
            Thêm vào nhóm
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Thông tin sinh viên (Chỉ đọc) */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Sinh viên được chọn</p>
            <p className="font-bold text-gray-900">{studentInfo.name}</p>
            <p className="text-sm text-gray-600">MSSV: {studentInfo.mssv}</p>
          </div>

          {/* Chọn nhóm */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Chọn nhóm muốn gán vào</label>
            
            {availableGroups.length > 0 ? (
              <select 
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                required
              >
                <option value="" disabled>-- Chọn nhóm --</option>
                {availableGroups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} (Sĩ số hiện tại: {g.currentCount}/{g.maxCount})
                  </option>
                ))}
              </select>
            ) : (
              // Trạng thái ngoại lệ: Nếu tất cả các nhóm đều đầy
              <div className="flex items-start gap-2 bg-orange-50 text-orange-700 p-4 rounded-xl border border-orange-100">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold mb-1">Không có nhóm khả dụng!</p>
                  <p>Tất cả các nhóm hiện tại đều đã đạt số lượng thành viên tối đa. Vui lòng tạo thêm nhóm mới hoặc điều chỉnh sĩ số.</p>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || availableGroups.length === 0 || !selectedGroupId}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}