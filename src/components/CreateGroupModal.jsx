// File: src/components/CreateGroupModal.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function CreateGroupModal({ isOpen, onClose }) {
  // Công tắc 2 bước giống hệt bảng Tạo lớp học
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", topic: "", memberCount: 0 });

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(1);
      setFormData({ name: "", topic: "", memberCount: 0 });
    }
  }, [isOpen, setStep, setFormData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-red-600 text-center mb-8">Tạo nhóm mới</h2>

        {step === 1 ? (
          /* BƯỚC 1: NHẬP LIỆU */
          <>
            <div className="space-y-5">
              <div className="grid grid-cols-[120px_1fr] items-center">
                <label className="font-bold text-gray-800 text-sm">Tên nhóm:</label>
                <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder="VD: Nhóm 1..." className="border border-gray-300 rounded-xl px-4 py-2 w-full text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center">
                <label className="font-bold text-gray-800 text-sm">Đề tài:</label>
                <input name="topic" value={formData.topic} onChange={handleChange} type="text" placeholder="Nhập tên đề tài..." className="border border-gray-300 rounded-xl px-4 py-2 w-full text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center">
                <label className="font-bold text-gray-800 text-sm">Số thành viên:</label>
                <input name="memberCount" value={formData.memberCount} onChange={handleChange} type="number" min={1} className="border border-gray-300 rounded-xl px-4 py-2 w-24 text-sm focus:outline-none focus:border-red-500 text-center" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-10">
              <button onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Hủy</button>
              <button onClick={() => setStep(2)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Xác nhận</button>
            </div>
          </>
        ) : (
          /* BƯỚC 2: XÁC NHẬN */
          <>
            <div className="space-y-6 text-gray-800 px-4 text-[15px]">
              <p><span className="font-bold inline-block w-32">Tên nhóm:</span> {formData.name || "Chưa nhập"}</p>
              <p><span className="font-bold inline-block w-32">Đề tài:</span> {formData.topic || "Chưa nhập"}</p>
              <p><span className="font-bold inline-block w-32">Số thành viên:</span> {formData.memberCount}</p>
            </div>
            <div className="flex justify-end gap-3 mt-10">
              <button onClick={() => setStep(1)} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Quay lại</button>
              <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Tạo nhóm</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}