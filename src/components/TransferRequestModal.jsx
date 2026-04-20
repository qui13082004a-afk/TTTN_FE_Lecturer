// File: src/components/TransferRequestModal.jsx
import { useState, useEffect } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";
// IMPORT API
import { fetchTransferRequests, fetchGroupStats, acceptTransferRequest, rejectTransferRequest } from "../services/api";

export default function TransferRequestModal({ isOpen, onClose }) {
  const [groupStats, setGroupStats] = useState({});
  const [requests, setRequests] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Trạng thái khi đang bấm Đồng ý/Từ chối

  // Fetch dữ liệu mỗi khi Modal được mở lên
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        setIsLoading(true);
        setErrorMessage("");
        
        const [statsData, requestsData] = await Promise.all([
          fetchGroupStats(),
          fetchTransferRequests()
        ]);

        setGroupStats(statsData);
        setRequests(requestsData);
        setIsLoading(false);
      };
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- XỬ LÝ: TỪ CHỐI ---
  const handleReject = async (id) => {
    setIsProcessing(true);
    const res = await rejectTransferRequest(id);
    if (res.success) {
        setRequests(reqs => reqs.filter(r => r.id !== id));
        setErrorMessage("");
    }
    setIsProcessing(false);
  };

  // --- XỬ LÝ: ĐỒNG Ý ---
  const handleAccept = async (req) => {
    setErrorMessage(""); 

    const targetStat = groupStats[req.targetGroup];

    // BƯỚC 1: KIỂM TRA RÀNG BUỘC (Frontend check nhanh trước khi gọi BE)
    if (targetStat && targetStat.current >= targetStat.max) {
      setErrorMessage(`Không thể duyệt! Nhóm ${req.targetGroup} đã đủ số lượng tối đa (${targetStat.max}/${targetStat.max}). Vui lòng Từ chối yêu cầu này.`);
      return; 
    }

    setIsProcessing(true);
    // BƯỚC 2: TRANSACTION
    const res = await acceptTransferRequest(req.id, req.targetGroup, req.oldGroup);
    
    if (res.success) {
        // Cập nhật state ngầm định để tính toán tiếp cho các yêu cầu sau
        setGroupStats(prev => ({
          ...prev,
          [req.targetGroup]: { ...prev[req.targetGroup], current: prev[req.targetGroup].current + 1 },
          [req.oldGroup]: { ...prev[req.oldGroup], current: prev[req.oldGroup].current - 1 }
        }));

        setRequests(reqs => reqs.filter(r => r.id !== req.id));
        alert(`Duyệt thành công! Đã chuyển ${req.name} sang Nhóm ${req.targetGroup}.`);
    }
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-red-600 border-b-2 border-red-600 pb-1">
            Danh sách sinh viên yêu cầu chuyển nhóm
          </h3>
          <button onClick={onClose} disabled={isProcessing} className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 font-medium text-sm animate-in fade-in">
              <AlertCircle size={20} />
              {errorMessage}
            </div>
          )}

          {isLoading ? (
             <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="animate-spin text-red-500 mb-2" size={32} />
                <p>Đang tải danh sách yêu cầu...</p>
             </div>
          ) : requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-800 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-2">Họ tên</th>
                    <th className="py-3 px-2 text-center">Nhóm cũ</th>
                    <th className="py-3 px-2 text-center">Nhóm muốn chuyển</th>
                    <th className="py-3 px-2">Lý do</th>
                    <th className="py-3 px-2 text-center w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2 font-medium text-gray-800">{req.name}</td>
                      <td className="py-4 px-2 text-center text-gray-600">{req.oldGroup}</td>
                      <td className="py-4 px-2 text-center text-gray-600">{req.targetGroup}</td>
                      <td className="py-4 px-2 text-gray-600 max-w-xs">{req.reason}</td>
                      <td className="py-4 px-2">
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => handleReject(req.id)}
                            disabled={isProcessing}
                            className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            Từ chối
                          </button>
                          <button 
                            onClick={() => handleAccept(req)}
                            disabled={isProcessing}
                            className="bg-[#10b981] hover:bg-green-600 text-white py-1.5 px-3 rounded text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            Đồng ý
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400">
              <p className="italic">Hiện tại không có yêu cầu chuyển nhóm nào.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}