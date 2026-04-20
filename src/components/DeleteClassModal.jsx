// File: src/components/DeleteClassModal.jsx
import { X, AlertTriangle } from "lucide-react";

export default function DeleteClassModal({ isOpen, onClose, classData, onConfirm }) {
  if (!isOpen || !classData) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl text-center">
        <button onClick={onClose} className="absolute top-6 right-6 text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors">
          <X size={24} />
        </button>

        <div className="flex justify-center mb-4 text-red-500">
          <AlertTriangle size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Xác nhận xóa lớp học</h2>
        <p className="text-gray-600 mb-8 px-4">
          Bạn có chắc chắn muốn xóa lớp <span className="font-bold text-gray-800">{classData.title}</span> không? Hành động này không thể hoàn tác.
        </p>

        <div className="flex justify-center gap-3">
          <button onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Hủy</button>
          <button onClick={() => onConfirm(classData.id)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Xác nhận xóa</button>
        </div>
      </div>
    </div>
  );
}