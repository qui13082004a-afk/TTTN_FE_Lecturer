// File: src/components/RemoveMemberModal.jsx
import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { removeMemberFromGroup } from "../services/api";

// BỔ SUNG: Thêm groupId vào props để biết đang xóa ở nhóm nào
export default function RemoveMemberModal({ isOpen, onClose, memberName, allMembers = [], onConfirm, groupName, groupId }) {
  const [step, setStep] = useState(1);
  const [newLeaderId, setNewLeaderId] = useState("");
  const [taskAssigneeId, setTaskAssigneeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(1);
      setNewLeaderId("");
      setTaskAssigneeId("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const memberToDelete = allMembers.find(m => m.name === memberName);
  const isLeader = memberToDelete?.role === "leader";
  const hasUnfinishedTasks = memberToDelete?.progress !== "100%";
  const eligibleMembers = allMembers.filter(m => m.name !== memberName);

  const handleNextFromStep1 = () => {
    if (isLeader) {
      setStep(2);
    } else if (hasUnfinishedTasks) {
      setStep(3);
    } else {
      handleFinalConfirm();
    }
  };

  const handleNextFromStep2 = () => {
    if (hasUnfinishedTasks) {
      setStep(3);
    } else {
      handleFinalConfirm();
    }
  };

  const handleFinalConfirm = async () => {
    if (!memberToDelete || !groupId) {
      alert("Lỗi: Không xác định được thành viên hoặc nhóm cần xóa.");
      return;
    }

    setIsLoading(true);
    
    // 1. GỌI API BACKEND: Hiện tại BE chỉ nhận id_sinh_vien và id_nhom
    // newLeaderId và taskAssigneeId giữ lại ở state để sẵn sàng cho nâng cấp BE sau này
    const response = await removeMemberFromGroup(memberToDelete.id, groupId);
    
    if (response.success) {
      setIsLoading(false);
      
      // 2. Báo cho component cha (GroupDetail) để update lại giao diện
      if (onConfirm) onConfirm(memberToDelete.id, newLeaderId, taskAssigneeId);
      
      // 3. Thông báo và đóng Modal
      alert(`Thành công! Sinh viên ${memberName} đã được mời ra khỏi ${groupName}.`);
      onClose();
    } else {
      setIsLoading(false);
      alert(response.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl text-center">
        
        <button onClick={onClose} disabled={isLoading} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors disabled:opacity-50">
          <X size={24} />
        </button>

        {/* ================= BƯỚC 1: XÁC NHẬN ================= */}
        {step === 1 && (
          <div className="animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-red-600 mb-4">Xác nhận xóa thành viên</h2>
            <p className="text-gray-700 mb-8 px-4 text-[15px]">
              Bạn có chắc muốn xóa sinh viên <span className="font-bold text-gray-900">{memberName}</span> ra khỏi <span className="font-bold text-gray-900">{groupName}</span> không?
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={onClose} disabled={isLoading} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">Hủy</button>
              <button onClick={handleNextFromStep1} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                {(!isLeader && !hasUnfinishedTasks) ? "Đồng ý Xóa" : "Tiếp tục"} {!(!isLeader && !hasUnfinishedTasks) && <ArrowRight size={18}/>}
              </button>
            </div>
          </div>
        )}

        {/* ================= BƯỚC 2: BẦU NHÓM TRƯỞNG MỚI ================= */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
            <h2 className="text-xl font-bold text-red-600 mb-4">Bầu Nhóm trưởng mới</h2>
            <p className="text-gray-700 mb-6 text-sm px-2">
              <span className="font-bold">{memberName}</span> đang là Nhóm trưởng. Vui lòng chỉ định người kế nhiệm chức vụ này.
            </p>
            <select 
              value={newLeaderId} 
              onChange={(e) => setNewLeaderId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-8 text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-gray-50/50 transition-all"
            >
              <option value="">-- Chọn nhóm trưởng mới --</option>
              {eligibleMembers.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
            </select>
            <div className="flex justify-center gap-4">
              <button onClick={() => setStep(1)} disabled={isLoading} className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"><ArrowLeft size={18}/> Quay lại</button>
              <button 
                disabled={!newLeaderId || isLoading} 
                onClick={handleNextFromStep2} 
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                 {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                 {!hasUnfinishedTasks ? "Hoàn tất & Xóa" : "Tiếp tục"} {hasUnfinishedTasks && <ArrowRight size={18}/>}
              </button>
            </div>
          </div>
        )}

        {/* ================= BƯỚC 3: BÀN GIAO CÔNG VIỆC ================= */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
            <h2 className="text-xl font-bold text-red-600 mb-4">Bàn giao công việc</h2>
            <p className="text-gray-700 mb-6 text-sm px-2">
              Vui lòng chọn người tiếp nhận các công việc dang dở của <span className="font-bold text-gray-900">{memberName}</span>.
            </p>
            <select 
              value={taskAssigneeId}
              onChange={(e) => setTaskAssigneeId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-8 text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-gray-50/50 transition-all"
            >
              <option value="">-- Chọn người nhận bàn giao --</option>
              {eligibleMembers.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
            </select>
            <div className="flex justify-center gap-4">
              <button onClick={() => setStep(isLeader ? 2 : 1)} disabled={isLoading} className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"><ArrowLeft size={18}/> Quay lại</button>
              <button 
                disabled={!taskAssigneeId || isLoading}
                onClick={handleFinalConfirm} 
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                Hoàn tất & Xóa
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}