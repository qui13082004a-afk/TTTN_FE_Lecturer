// File: src/pages/ClassDetail.jsx
import CreateGroupModal from "../components/CreateGroupModal";
import AddStudentToGroupModal from "../components/AddStudentToGroupModal";
import { useState, useEffect } from "react";
import { Search, FileSpreadsheet, PlusCircle, Bell, Plus, FolderSync, Loader2, FileText } from "lucide-react";
// BỔ SUNG: Import useParams để lấy ID lớp từ đường link (URL)
import { Link, useParams } from "react-router-dom"; 
import ImportStudentModal from "../components/ImportStudentModal";
import TransferRequestModal from "../components/TransferRequestModal";
import CreateReportModal from "../components/CreateReportModal"; 

import { fetchStudents, fetchClassInfo, fetchGroupsForClass, uploadStudentExcel, createReportRequest, fetchPendingTransferCount } from "../services/api";

export default function ClassDetail() {
  // Lấy ID lớp từ URL. Nếu chưa setup URL thì mặc định là số 7 (giống Postman của bạn)
  const { id } = useParams();
  const classId = id || 7; 

  const [activeTab, setActiveTab] = useState("students");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedStudentForGroup, setSelectedStudentForGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState({});
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. GỌI API LẤY TẤT CẢ DỮ LIỆU KHI VỪA VÀO TRANG ---
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      const [studentsData, infoData, groupsData, countData] = await Promise.all([
        fetchStudents(classId, ""), 
        fetchClassInfo(classId),
        fetchGroupsForClass(classId), 
        fetchPendingTransferCount(classId)
      ]);
      setStudents(studentsData);
      setClassInfo(infoData);
      setGroups(groupsData);
      setPendingCount(countData);
      setIsLoading(false);
    };
    loadAllData();
  }, [classId]);

  // --- 2. GỌI API TÌM KIẾM TỪ BACKEND (KỸ THUẬT DEBOUNCE) ---
  useEffect(() => {
    // Chờ người dùng gõ xong 500ms mới gọi API để chống spam Backend
    const delayDebounceFn = setTimeout(async () => {
      // Bỏ qua lần render đầu tiên khi đang loading
      if (!isLoading) { 
        const data = await fetchStudents(classId, searchQuery);
        setStudents(data);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, classId, isLoading]); // Chạy lại mỗi khi searchQuery thay đổi

  // --- 3. XỬ LÝ IMPORT FILE EXCEL ---
  const handleProcessExcel = async (file) => {
    // Gọi API truyền file và classId
    const response = await uploadStudentExcel(file, classId);
    
    if (response.success) {
      alert(response.message);
      setIsImportModalOpen(false);
      
      // VÔ CÙNG QUAN TRỌNG: Gọi lại API fetchStudents để tải danh sách mới nhất
      const newData = await fetchStudents(classId, searchQuery);
      setStudents(newData);
    } else {
      alert(response.message);
    }
  };

  const handleCreateClassReport = async (formData) => {
    const res = await createReportRequest(formData);
    if (res.success) {
      setIsCreateReportModalOpen(false);
      alert(`Đã giao thành công "${formData.title}" cho toàn bộ ${classInfo.totalGroups} nhóm!`);
    }
  };

  // ĐÃ XÓA: filteredStudents (Vì Backend đã làm nhiệm vụ tìm kiếm và trả về đúng danh sách cần thiết vào state "students" rồi)

  const tabActiveStyle = "px-6 py-2.5 bg-white border border-b-0 border-gray-300 rounded-t-xl font-bold text-gray-800 relative top-[1px] z-10 cursor-default";
  const tabPassiveStyle = "px-6 py-2.5 bg-gray-200 border border-gray-300 rounded-t-xl text-gray-600 font-medium cursor-pointer hover:bg-gray-300 relative top-[1px] z-0 ml-1";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-gray-500">
        <Loader2 className="animate-spin text-red-500 mb-4" size={40} />
        <p>Đang tải chi tiết lớp học...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="text-xl mb-8">
        <Link to="/classes" className="text-gray-400 hover:text-gray-600 transition-colors font-medium">Danh sách lớp học</Link>
        <span className="text-gray-800 font-bold mx-2">{">"} {classInfo.name || "Chi tiết lớp"}</span>
      </div>

      <div className="flex px-4">
        <div onClick={() => setActiveTab("students")} className={activeTab === "students" ? tabActiveStyle : tabPassiveStyle}>Danh sách sinh viên</div>
        <div onClick={() => setActiveTab("groups")} className={activeTab === "groups" ? tabActiveStyle : tabPassiveStyle}>Quản lý nhóm</div>
      </div>

      <div className={`bg-white border border-gray-300 rounded-xl p-6 relative z-0 shadow-sm ${activeTab === "students" ? "rounded-tl-none" : ""}`}>
        
        {/* ============================================== */}
        {/* TAB 1: DANH SÁCH SINH VIÊN                     */}
        {/* ============================================== */}
        {activeTab === "students" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-80">
                {/* Thanh tìm kiếm sẽ tự động gọi API sau khi ngừng gõ 0.5s */}
                <input 
                  type="text" 
                  placeholder="Tìm MSSV hoặc Tên sinh viên" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 text-sm" 
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
              </div>
              <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
                Import danh sách <FileSpreadsheet size={20} />
              </button>
            </div>

            <div className="border border-gray-300 rounded-2xl overflow-hidden min-h-[200px]">
              <table className="w-full text-sm text-center">
                <thead className="border-b border-gray-300 text-gray-800 font-bold h-12 bg-gray-50">
                  <tr>
                    <th className="font-bold w-16">STT</th>
                    <th className="font-bold">MSSV</th>
                    <th className="font-bold">Họ và tên</th>
                    <th className="font-bold">Email</th>
                    <th className="font-bold">Nhóm</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 bg-white">
                  {/* SỬ DỤNG TRỰC TIẾP STATE 'students' VÌ BE ĐÃ LỌC CHO MÌNH RỒI */}
                  {students.length > 0 ? (
                    students.map((student, index) => (
                      <tr key={student.id} className="h-12 border-b last:border-b-0 border-gray-100 hover:bg-gray-50 transition-colors">
                        <td>{index + 1}</td> 
                        <td className="font-medium">{student.mssv}</td>
                        <td className="font-medium">{student.name}</td>
                        <td>{student.email}</td>
                        <td className="font-medium">
                          {student.group === "X" || !student.group ? <span className="text-red-600 font-bold">X</span> : student.group}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="py-10 text-gray-400 italic">Không tìm thấy sinh viên nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* TAB 2: QUẢN LÝ NHÓM                            */}
        {/* ============================================== */}
        {activeTab === "groups" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-center gap-16 items-center mb-10 mt-4">
              <div className="border border-gray-300 rounded-3xl p-5 flex items-center gap-6 shadow-sm">
                <div className="bg-green-100 p-4 rounded-2xl text-green-500"><FolderSync size={40} /></div>
                <div className="text-sm space-y-1 text-gray-800">
                  <p className="font-bold text-gray-800 absolute -mt-10 bg-white px-2 ml-[-10px]">Thống kê nhanh</p>
                  <p>Đã tham gia: <span className="font-bold">{classInfo.assignedStudents || 0}/{classInfo.totalStudents || 0}</span></p>
                  <p>Tổng số nhóm: <span className="font-bold">{classInfo.totalGroups || 0}</span></p>
                  <p className={`font-bold mt-2 ${classInfo.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                    {classInfo.isExpired ? 'Đã hết hạn đăng ký' : 'Đang mở đăng ký'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 items-center">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsCreateReportModalOpen(true)} 
                    className="bg-[#0b57d0] hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2 shadow-sm"
                  >
                    Giao task chung <FileText size={20} />
                  </button>

                  <button onClick={() => setIsCreateGroupModalOpen(true)} disabled={classInfo.isExpired} className={`${classInfo.isExpired ? 'bg-gray-400 cursor-not-allowed opacity-50' : 'bg-gray-500 hover:bg-gray-600'} text-white px-5 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2`}>
                    Tạo nhóm mới <PlusCircle size={20} />
                  </button>
                </div>

                {classInfo.isExpired && (classInfo.assignedStudents < classInfo.totalStudents) && (
                  <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-sm w-full">Phân nhóm tự động</button>
                )}
                
                <div onClick={() => setIsTransferModalOpen(true)} className="flex items-center gap-2 text-red-600 font-bold mt-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="relative">
                  <Bell size={20} />
                  {/* Nếu pendingCount lớn hơn 0 thì mới hiện cái chấm đỏ có chứa con số */}
                  {pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white ring-2 ring-white font-bold">
                      {pendingCount}
                    </span>
                  )}
                </div>
                  <span className="underline decoration-red-600 underline-offset-4">Yêu cầu chuyển nhóm</span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-300 rounded-2xl overflow-hidden grid grid-cols-[1fr_2fr]">
              <div className="border-r border-gray-300 bg-white">
                <h3 className="font-bold text-gray-800 text-center py-4 border-b border-gray-300">Sinh viên <br/> chưa có nhóm</h3>
                {students.filter(s => s.group === "X" || !s.group).map(student => (
                   <div key={student.id} className="p-4 flex items-center justify-between text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                    <span className="font-medium text-gray-800">{student.mssv}</span>
                    <span className="font-bold text-gray-800 ml-2">{student.name}</span>
                    <button onClick={() => { setSelectedStudentForGroup({ mssv: student.mssv, name: student.name }); setIsAddStudentModalOpen(true); }} className="text-red-500 hover:text-white hover:bg-red-500 rounded-full p-0.5 border border-red-500 transition-colors ml-auto"><Plus size={18} /></button>
                  </div>
                ))}
              </div>

              <div className="bg-white">
                <h3 className="font-bold text-gray-800 text-center py-4 border-b border-gray-300">Danh sách nhóm</h3>
                <div className="p-8 pl-12">
                  <div className="flex flex-col gap-8">
                    {groups.map((group, index) => (
                      <div key={group.id} className="relative group-item">
                        {index !== groups.length - 1 && <div className="absolute left-[5px] top-6 bottom-[-2rem] w-[2px] bg-gray-200"></div>}
                        <div className="absolute w-3 h-3 bg-red-500 rounded-full left-0 top-6 z-10 ring-4 ring-white"></div>
                        <div className="pl-8">
                          <Link to="/classes/group-detail" className={`block border border-gray-300 rounded-xl p-4 max-w-sm hover:shadow-md transition-shadow cursor-pointer ${group.currentCount === group.maxCount ? 'bg-gray-50' : 'bg-white'}`}>
                            <div className="flex justify-between items-start border-b border-gray-300 pb-2 mb-2">
                              <div>
                                <p className="font-bold text-gray-800 text-base hover:text-red-600 transition-colors">{group.name}</p>
                                <p className="text-gray-800 font-medium text-sm mt-0.5">Đề tài của {group.name}</p>
                              </div>
                              <FolderSync size={24} className="text-gray-500 hover:text-red-600 transition-colors" />
                            </div>
                            <p className="text-gray-600 text-sm">Sĩ số: <span className="font-bold text-gray-800">{group.currentCount}/{group.maxCount}</span></p>
                            <p className="text-gray-500 text-xs mt-1 flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full inline-block ${group.currentCount === group.maxCount ? 'bg-red-500' : 'bg-green-500'}`}></span> Cập nhật gần đây</p>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CÁC MODAL */}
      <ImportStudentModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSubmit={handleProcessExcel} />
      <TransferRequestModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} />
      <CreateGroupModal isOpen={isCreateGroupModalOpen} onClose={() => setIsCreateGroupModalOpen(false)} />
      
      <CreateReportModal isOpen={isCreateReportModalOpen} onClose={() => setIsCreateReportModalOpen(false)} onSubmit={handleCreateClassReport} />

      <AddStudentToGroupModal 
        isOpen={isAddStudentModalOpen} 
        onClose={() => setIsAddStudentModalOpen(false)} 
        studentInfo={selectedStudentForGroup}
        groups={groups} 
      />
    </div>
  );
}