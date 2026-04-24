// File: src/components/EditClassModal.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function EditClassModal({ isOpen, onClose, classData, onSave }) {
  const [formData, setFormData] = useState({ title: "", semester: "", students: 0, groups: 0 });

  // Tự động điền dữ liệu cũ vào form khi mở bảng
  useEffect(() => {
    if (isOpen && classData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: classData.title || "",
        semester: classData.semester || "",
        students: classData.students || 0,
        groups: classData.groups || 0,
      });
    }
  }, [isOpen, classData]);

  if (!isOpen || !classData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-red-600 text-center mb-8">Chỉnh sửa lớp học</h2>

        <div className="space-y-5">
          <div className="grid grid-cols-[140px_1fr] items-center">
            <label className="font-bold text-gray-800 text-sm">Tên môn học:</label>
            <input name="title" value={formData.title} onChange={handleChange} type="text" className="border border-gray-300 rounded-xl px-4 py-2 w-full text-sm focus:outline-none focus:border-red-500" />
          </div>
          <div className="grid grid-cols-[140px_1fr] items-center">
            <label className="font-bold text-gray-800 text-sm">Học kì:</label>
            <select name="semester" value={formData.semester} onChange={handleChange} className="border border-gray-300 rounded-xl px-4 py-2 w-40 text-sm focus:outline-none focus:border-red-500">
              <option value="HK1 25-26">HK1 25-26</option>
              <option value="HK2 25-26">HK2 25-26</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-10">
          <button onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Hủy</button>
          <button onClick={() => onSave({ ...classData, ...formData })} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
}