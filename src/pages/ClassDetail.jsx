/* eslint-disable no-unused-vars */
// File: src/pages/ClassDetail.jsx
import CreateGroupModal from "../components/CreateGroupModal";
import AddStudentToGroupModal from "../components/AddStudentToGroupModal";
import { useState, useEffect } from "react";
import { Search, FileSpreadsheet, PlusCircle, Bell, Plus, FolderSync, Loader2, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom"; 
import ImportStudentModal from "../components/ImportStudentModal";
import TransferRequestModal from "../components/TransferRequestModal";
import CreateReportModal from "../components/CreateReportModal"; 

import { fetchStudents, fetchClassInfo, fetchGroupsForClass, uploadStudentExcel, createReportRequest, fetchPendingTransferCount, createGroup, addStudentToGroup, autoGroupClass } from "../services/api";

export default function ClassDetail() {
  const { id } = useParams();
  const classId = id;

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
    const delayDebounceFn = setTimeout(async () => {
      if (!isLoading) { 
        const data = await fetchStudents(classId, searchQuery);
        setStudents(data);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, classId, isLoading]);

  // --- 3. XỬ LÝ IMPORT FILE EXCEL ---
  const handleProcessExcel = async (file) => {
    const response = await uploadStudentExcel(file, classId);
    if (response.success) {
      alert(response.message);
      setIsImportModalOpen(false); 
      const newData = await fetchStudents(classId, searchQuery);
      setStudents(newData);
    } else {
      alert(response.message);
    }
  };

  // --- 4. HÀM XỬ LÝ TẠO NHÓM ---
  const handleCreateGroupSubmit = async (formData) => {
    const groupData = {
      ten_nhom: formData.name, 
      ma_nhom: "NHOM-" + Date.now().toString().slice(-4), 
      so_luong_toi_da: Number(formData.maxCount || 5) 
    };

    const response = await createGroup(classId, groupData);
    
    if (response.success) {
      setIsCreateGroupModalOpen(false); 
      const [newGroups, newInfo] = await Promise.all([
        fetchGroupsForClass(classId),
        fetchClassInfo(classId) 
      ]);
      setGroups(newGroups);
      setClassInfo(newInfo); 
    } else {
      alert(response.message);
    }
  };

  // --- 5. HÀM XỬ LÝ THÊM SINH VIÊN VÀO NHÓM ---
  const handleAddStudentSubmit = async (groupId) => {
    if (!selectedStudentForGroup?.id) return;

    const response = await addStudentToGroup(classId, groupId, selectedStudentForGroup.id);
    
    if (response.success) {
      setIsAddStudentModalOpen(false); 
      
      const [newStudents, newGroups, newInfo] = await Promise.all([
        fetchStudents(classId, searchQuery),
        fetchGroupsForClass(classId),
        fetchClassInfo(classId) 
      ]);
      setStudents(newStudents);
      setGroups(newGroups);
      setClassInfo(newInfo); 
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

  // --- HÀM XỬ LÝ PHÂN NHÓM TỰ ĐỘNG ---
  const handleAutoGroupSubmit = async () => {
    // Hỏi lại cho chắc ăn
    const confirm = window.confirm("Bạn có chắc chắn muốn hệ thống tự động phân nhóm cho các sinh viên còn lại không?");
    if (!confirm) return;

    // Gọi API xuống Backend
    const response = await autoGroupClass(classId);
    
    if (response.success) {
      alert(response.message);
      
      // Thành công thì gọi API hút lại dữ liệu để giao diện tự cập nhật
      const [newStudents, newGroups, newInfo] = await Promise.all([
        fetchStudents(classId, searchQuery),
        fetchGroupsForClass(classId),
        fetchClassInfo(classId) 
      ]);
      setStudents(newStudents);
      setGroups(newGroups);
      setClassInfo(newInfo); 
    } else {
      alert("Lỗi: " + response.message);
    }
  };

  const tabActiveStyle = "px-6 py-2.5 bg-white border border-b-0 border-gray-300 rounded-t-xl font-bold text-gray-800 relative top-[1px] z-10 cursor-default";
  const tabPassiveStyle = "px-6 py-2.5 bg-gray-200 border border-gray-300 rounded-t-xl text-gray-600 font-medium cursor-pointer hover:bg-gray-300 relative top-[1px] z-0 ml-1";
  
  // TỰ ĐẾM SỐ LIỆU TRÊN FRONTEND (Đã dọn dẹp biến lọc chuẩn xác)
  const totalStudentsReal = students.length;
  const assignedStudentsReal = students.filter(s => s.group && s.group !== "X").length;
  const totalGroupsReal = groups.length;
  const ungroupedStudents = students.filter(s => s.group === "X");

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
                    <th className="font-bold w-14">STT</th>
                    <th className="font-bold">Mã sinh viên</th>
                    <th className="font-bold text-left">Họ lót</th>
                    <th className="font-bold text-left">Tên</th>
                    <th className="font-bold">Mã lớp</th>
                    <th className="font-bold">Email</th>
                    <th className="font-bold">Nhóm</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 bg-white">
                  {students.length > 0 ? (
                    students.map((student, index) => {
                      const nameParts = (student.name || "").trim().split(" ");
                      const ten = nameParts.length > 0 ? nameParts.pop() : ""; 
                      const hoLot = nameParts.join(" "); 

                      return (
                        <tr key={student.id} className="h-12 border-b last:border-b-0 border-gray-100 hover:bg-gray-50 transition-colors">
                          <td>{index + 1}</td> 
                          <td className="font-bold text-gray-700">{student.mssv}</td>
                          <td className="text-left font-medium">{hoLot}</td>
                          <td className="text-left font-bold text-gray-900">{ten}</td>
                          <td className="font-medium text-gray-600">{student.maLop || "-"}</td>
                          <td className="text-gray-500 text-sm">{student.email}</td>
                          <td className="font-bold text-sm">
                            {student.group === "X" ? (
                              <span className="text-red-500">X</span>
                            ) : (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md">{student.group}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="7" className="py-12 text-gray-400 italic">Không tìm thấy sinh viên nào.</td></tr>
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
                  
                  <p>Đã tham gia: <span className="font-bold">{classInfo.assignedStudents}/{classInfo.totalStudents}</span></p>
                  <p>Tổng số nhóm: <span className="font-bold">{totalGroupsReal}</span></p>
                  
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

                  <button 
                    onClick={() => setIsCreateGroupModalOpen(true)} 
                    disabled={classInfo.isExpired} 
                    className={`${classInfo.isExpired ? 'bg-gray-400 cursor-not-allowed opacity-50' : 'bg-red-600 hover:bg-red-700'} text-white px-5 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2`}
                  >
                    Tạo nhóm mới <PlusCircle size={20} />
                  </button>
                </div>

                {classInfo.isExpired && (classInfo.assignedStudents < classInfo.totalStudents) && (
                  <button onClick={handleAutoGroupSubmit} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-sm w-full">
                    Phân nhóm tự động
                  </button>
                )}
                
                <div onClick={() => setIsTransferModalOpen(true)} className="flex items-center gap-2 text-red-600 font-bold mt-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="relative">
                  <Bell size={20} />
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
              {/* CỘT TRÁI: SINH VIÊN CHƯA CÓ NHÓM */}
              <div className="border-r border-gray-300 bg-white flex flex-col max-h-[600px]">
                <h3 className="font-bold text-gray-800 text-center py-4 border-b border-gray-300 shrink-0">
                  Sinh viên <br/> chưa có nhóm
                </h3>
                
                <div className="overflow-y-auto flex-1">
                  {ungroupedStudents.length > 0 ? (
                    ungroupedStudents.map(student => (
                      <div key={student.id} className="p-4 flex items-center justify-between text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                        <span className="font-medium text-gray-800">{student.mssv}</span>
                        <span className="font-bold text-gray-800 ml-2">{student.name}</span>
                        <button 
                          onClick={() => { 
                            setSelectedStudentForGroup({ id: student.id, mssv: student.mssv, name: student.name }); 
                            setIsAddStudentModalOpen(true); 
                          }} 
                          className="text-red-500 hover:text-white hover:bg-red-500 rounded-full p-0.5 border border-red-500 transition-colors ml-auto"
                          title="Thêm vào nhóm"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full mt-10">
                      <p className="font-bold text-green-600 mb-1">Tuyệt vời!</p>
                      <p className="text-sm">Tất cả sinh viên đều đã có nhóm.</p>
                    </div>
                  )}
                </div>
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
                          <Link 
                            to={`/groups/${group.id}`} 
                            state={{ groupName: group.name }}  
                            className={`block border border-gray-300 rounded-xl p-4 max-w-sm hover:shadow-md transition-shadow cursor-pointer ${group.currentCount === group.maxCount ? 'bg-gray-50' : 'bg-white'}`}
                          >
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
      <CreateReportModal isOpen={isCreateReportModalOpen} onClose={() => setIsCreateReportModalOpen(false)} onSubmit={handleCreateClassReport} />

      <CreateGroupModal 
        isOpen={isCreateGroupModalOpen} 
        onClose={() => setIsCreateGroupModalOpen(false)} 
        onSubmit={handleCreateGroupSubmit} 
      />
      
      <AddStudentToGroupModal 
        isOpen={isAddStudentModalOpen} 
        onClose={() => setIsAddStudentModalOpen(false)} 
        studentInfo={selectedStudentForGroup}
        groups={groups} 
        onSubmit={handleAddStudentSubmit}   
      />
    </div>
  );
}