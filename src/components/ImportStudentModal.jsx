// File: src/components/ImportStudentModal.jsx
import { useState, useRef } from "react";
import { X, UploadCloud, FileSpreadsheet, Loader2, Download, AlertCircle } from "lucide-react";

export default function ImportStudentModal({ isOpen, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // --- CÁC HÀM XỬ LÝ KÉO THẢ (DRAG & DROP) ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  // --- LOGIC RÀNG BUỘC ĐẶC TẢ (FILE TYPE & SIZE) ---
  const validateAndSetFile = (selectedFile) => {
    setError(""); // Reset lỗi
    if (!selectedFile) return;

    // 1. Validate định dạng (Chỉ nhận Excel/CSV)
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv" // .csv
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError("Định dạng file không hợp lệ. Vui lòng chỉ tải lên file .xlsx, .xls hoặc .csv");
      return;
    }

    // 2. Validate dung lượng (Tối đa 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (selectedFile.size > maxSize) {
      setError("Dung lượng file quá lớn. Vui lòng chọn file dưới 5MB.");
      return;
    }

    // Nếu qua bài test, lưu file vào State
    setFile(selectedFile);
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation(); // Ngăn việc click xóa file làm mở lại hộp thoại chọn file
    setFile(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Vui lòng chọn một file trước khi tiếp tục.");
      return;
    }
    
    setLoading(true);
    // Gọi hàm upload từ Props (được truyền từ ClassDetail)
    await onSubmit(file);
    setLoading(false);
    
    // Reset form sau khi upload xong
    setFile(null);
    setError("");
  };

  const handleClose = () => {
    setFile(null);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">Import danh sách sinh viên</h3>
          <button onClick={handleClose} disabled={loading} className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          
          {/* Link tải file mẫu (BẮT BUỘC THEO ĐẶC TẢ) */}
          <div className="flex justify-end">
            <a href="#" className="flex items-center gap-1.5 text-sm font-bold text-[#1a66ff] hover:text-blue-800 transition-colors">
              <Download size={16} /> Tải file Excel mẫu tại đây
            </a>
          </div>

          {/* Vùng Kéo thả (Drag & Drop Zone) */}
          <div 
            onClick={() => !file && fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all
              ${isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'}
              ${file ? 'cursor-default border-solid border-gray-200 bg-gray-50' : 'cursor-pointer'}
            `}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv" // Giới hạn từ phía Browser
            />

            {!file ? (
              <>
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud size={28} />
                </div>
                <p className="font-bold text-gray-800 mb-1">Chọn file Excel (.xlsx, .csv)</p>
                <p className="text-sm text-gray-500">Hoặc kéo thả file từ máy tính vào đây</p>
                <p className="text-xs text-gray-400 mt-4">Dung lượng tối đa: 5MB</p>
              </>
            ) : (
              // Giao diện khi ĐÃ CHỌN FILE
              <div className="w-full flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                  <FileSpreadsheet size={24} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-bold text-gray-800 text-sm truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={handleRemoveFile}
                  disabled={loading}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Xóa file"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Hiển thị Lỗi (nếu có) */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Khu vực 2 Nút (Hủy & Xác nhận) */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !file}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-red-400"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Tải lên"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}