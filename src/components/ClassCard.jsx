// File: src/components/ClassCard.jsx
import { Folder, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClassCard({ id, title, semester, status, students, groups, onEditClick, onDeleteClick }) {
  const isOpened = status === "Đang mở";
  const navigate = useNavigate();

  const handleCardClick = () => {
    // ĐÃ SỬA: Dùng dấu backtick (`) để kẹp biến id vào URL
    navigate(`/classes/detail/${id}`);
  };

  const handleActionClick = (e, actionType) => {
    e.stopPropagation(); // Chặn click lan ra ngoài
    
    // Gửi toàn bộ dữ liệu của thẻ này lên trang chính
    const currentClassData = { id, title, semester, status, students, groups };
    
    if (actionType === 'edit') {
      onEditClick(currentClassData);
    } else if (actionType === 'delete') {
      onDeleteClick(currentClassData);
    }
  };

  return (
    <div onClick={handleCardClick} className="bg-white border border-gray-300 rounded-2xl flex flex-col hover:shadow-lg hover:border-red-400 transition-all cursor-pointer group">
      <div className="p-4 border-b border-gray-100 rounded-t-2xl group-hover:bg-red-50/50 transition-colors">
        <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-red-600 transition-colors">{title}</h3>
        <p className="text-gray-600 text-sm font-medium mt-1">{semester}</p>
      </div>
      
      <div className="p-4 flex-1 space-y-1.5 text-sm text-gray-700">
        <p>Trạng thái đăng kí: <span className={`font-bold ${isOpened ? "text-green-500" : "text-red-600"}`}>{status}</span></p>
        <p>Số sinh viên: <span className="font-medium">{students}</span></p>
        <p>Số nhóm: <span className="font-medium">{groups}</span></p>
      </div>
      
      <div className="p-3 border-t border-gray-100 flex justify-end gap-3 text-black">
        <button onClick={(e) => handleActionClick(e, 'edit')} className="hover:text-yellow-500 transition-colors" title="Sửa lớp học">
          <Edit size={22} fill="currentColor" />
        </button>
        <button onClick={(e) => handleActionClick(e, 'delete')} className="hover:text-red-600 transition-colors" title="Xóa lớp học">
          <Trash2 size={22} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}