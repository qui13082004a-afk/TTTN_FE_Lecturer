// File: src/services/api.js
/* eslint-disable no-unused-vars */
import axios from 'axios';

// =========================================================
// CẤU HÌNH ĐƯỜNG ỐNG KẾT NỐI API THẬT
// =========================================================
const api = axios.create({
  baseURL: 'https://tttn-be-yhdg.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// Tự động gắn Token vào mọi Request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


// =========================================================
// 1. XÁC THỰC (AUTHENTICATION)
// =========================================================

export const checkAuth = () => {
  return !!localStorage.getItem("stu_token");
};

export const loginAuth = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data; 
    
    localStorage.setItem("stu_token", data.token); 
    localStorage.setItem("stu_user", JSON.stringify(data.user)); 

    return { success: true, message: data.message };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || "Lỗi kết nối đến máy chủ" 
    };
  }
};

export const logoutAuth = () => {
  localStorage.removeItem("stu_token");
  localStorage.removeItem("stu_user");
};


// =========================================================
// 2. BẢNG ĐIỀU KHIỂN (DASHBOARD)
// =========================================================

export const fetchDashboardData = async () => {
  try {
    const response = await api.get('/dashboard/lecturer/summary');
    const beSummary = response.data.summary;

    const stats = {
      classes: beSummary.lop_dang_phu_trach,
      groups: beSummary.tong_so_nhom,
      pendingClasses: beSummary.lop_can_chot_nhom,
      pendingTasks: beSummary.task_sap_tre_han
    };

    // Tạm giữ Mock Data cho 2 phần này chờ BE
    const actionItems = [
      { id: 7, className: "Thực tập tốt nghiệp", statusText: "Hết hạn đăng ký", isExpired: true, unassignedCount: 10 },
      { id: 8, className: "Kiểm thử phần mềm", statusText: "Đang mở", isExpired: false, unassignedCount: 20 }
    ];
    const notifications = [
      { id: 1, subject: "Lập trình web", action: "Nhóm 1 nộp báo cáo", time: "6 giờ trước" }
    ];

    return { stats, actionItems, notifications };
  } catch (error) {
    console.error("Lỗi tải Dashboard:", error);
    return { 
      stats: { classes: 0, groups: 0, pendingClasses: 0, pendingTasks: 0 }, 
      actionItems: [], notifications: [] 
    };
  }
};

export const autoGroupClass = async (classId) => {
  try {
    const response = await api.post(`/classes/${classId}/auto-group`);
    return { success: true, message: response.data?.message || "Phân nhóm thành công!" }; 
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Lỗi phân nhóm tự động" };
  }
};


// =========================================================
// 3. QUẢN LÝ LỚP HỌC (CLASSES)
// =========================================================

export const fetchClasses = async () => {
  try {
    const userStr = localStorage.getItem("stu_user");
    if (!userStr) return [];
    const user = JSON.parse(userStr);
    
    const response = await api.get(`/classes/lecturer/${user.id}`);
    if (!response.data.classes) return [];
    
    return response.data.classes.map((item) => ({
      id: item.id_lop,
      title: item.ten_lop,
      semester: item.hoc_ky,
      status: item.nhan_trang_thai,
      students: item.so_sinh_vien || 0,
      groups: item.so_nhom || 0,
      maxStudents: item.si_so_toi_da,
      maxGroups: item.so_nhom_toi_da,
      deadline: item.han_chot_dang_ky 
    }));
  } catch (error) {
    console.error("Lỗi lấy danh sách lớp:", error);
    return [];
  }
};

export const createClass = async (classData) => {
  try {
    const user = JSON.parse(localStorage.getItem("stu_user"));
    const payload = {
      id_giang_vien: user.id,
      ten_lop: classData.title,
      ma_lop: "AUTO_GEN_" + Date.now(),
      id_mon_hoc: 401, 
      hoc_ky: classData.semester,
      
      // ĐÃ SỬA: Cố định một con số rất lớn thay vì lấy từ Form
      si_so_toi_da: 999, 
      so_nhom_toi_da: 99, 
      
      mo_ta: classData.title,
      han_chot_dang_ky: classData.deadline + " 23:59:59"
    };

    await api.post('/classes', payload);
    return { success: true, message: "Tạo lớp học thành công!" };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Lỗi khi tạo lớp học" };
  }
};

export const updateClass = async (classId, updateData) => {
  try {
    await api.patch(`/classes/${classId}`, {
      ten_lop: updateData.title,
      han_chot_dang_ky_nhom: updateData.deadline
    });
    return { success: true, message: "Cập nhật lớp thành công!" };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Lỗi cập nhật lớp" };
  }
};

export const deleteClass = async (classId) => {
  try {
    await api.delete(`/classes/${classId}`);
    return { success: true, message: "Đã xóa lớp học thành công!" };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Lỗi xóa lớp" };
  }
};


// =========================================================
// 4. DANH SÁCH SINH VIÊN VÀ IMPORT
// =========================================================

export const fetchStudents = async (classId, searchQuery = "") => {
  try {
    let url = `/classes/${classId}/students`;
    if (searchQuery) url += `?q=${searchQuery}`;
    
    const response = await api.get(url);
    const beStudents = response.data.students || [];

    return beStudents.map(st => ({
      id: st.id_sinh_vien,
      mssv: st.mssv,
      name: st.ho_ten, 
      maLop: st.ma_lop || "", 
      email: st.email,
      // ĐÃ SỬA CHỖ NÀY: Chui vào object group để lấy ten_nhom, nếu không có thì gán là "X"
      group: st.group?.ten_nhom || "X" 
    }));
  } catch (error) {
    console.error("Lỗi lấy danh sách sinh viên:", error);
    return [];
  }
};
export const uploadStudentExcel = async (file, classId) => {
  try {
    const formData = new FormData();
    formData.append('file', file); // Bây giờ chỉ cần ném mỗi cái file vào hộp là đủ

    // ĐÃ SỬA: Thay thế bằng đường link API mới kẹp classId vào thẳng URL
    const response = await api.post(`/classes/${classId}/students/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return { 
      success: true, 
      message: response.data.message || "Import file thành công!", 
      warnings: response.data.warnings || [],
      newStudents: [] 
    };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Lỗi import file Excel!" };
  }
};


// =========================================================
// 5. KHÔNG GIAN LÀM VIỆC NHÓM (WORKSPACE)
// =========================================================

export const fetchClassInfo = async (classId) => {
  try {
    const [infoRes, statsRes] = await Promise.all([
      api.get(`/classes/${classId}`),
      api.get(`/classes/${classId}/group-management-summary`)
    ]);

    const info = infoRes.data;
    const summary = statsRes.data;

    // TỰ ĐỘNG TÍNH THỜI GIAN HẾT HẠN NGAY TRÊN TRÌNH DUYỆT
    const deadlineStr = summary.han_chot_dang_ky || info.han_chot_dang_ky || info.class?.han_chot_dang_ky;
    let isExpiredReal = summary.registration_status?.is_expired || false;

    if (deadlineStr) {
      const deadlineDate = new Date(deadlineStr).getTime();
      const now = new Date().getTime();
      // Nếu thời gian hiện tại lớn hơn hạn chót -> Đã hết hạn
      isExpiredReal = now > deadlineDate; 
    }

    return {
      id: classId,
      name: info.ten_lop || info.class?.ten_lop || "Chi tiết lớp",
      assignedStudents: summary.stats?.grouped_students || 0,
      totalStudents: summary.stats?.total_students || 0,
      totalGroups: summary.stats?.total_groups || 0, 
      isExpired: isExpiredReal // Trả về kết quả thực tế theo đồng hồ
    };
  } catch (error) {
    console.error("Lỗi lấy thông tin lớp:", error);
    return {};
  }
};

export const fetchGroupsForClass = async (classId) => {
  try {
    const response = await api.get(`/classes/${classId}/groups`);
    const beGroups = response.data.groups || response.data || [];
    
    return beGroups.map(g => ({
      id: g.id_nhom,
      name: g.ten_nhom,
      currentCount: g.so_thanh_vien || 0,
      maxCount: g.so_luong_toi_da || 5
    }));
  } catch (error) {
    console.error("Lỗi lấy danh sách nhóm:", error);
    return [];
  }
};

export const createGroup = async (classId, groupData) => {
  try {
    const response = await api.post(`/classes/${classId}/groups`, groupData);
    return { success: true, message: response.data.message || "Tạo nhóm thành công" };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Lỗi tạo nhóm" };
  }
};

export const addStudentToGroup = async (classId, groupId, studentId) => {
  try {
    const response = await api.post(`/classes/${classId}/groups/${groupId}/members`, { id_sinh_vien: studentId });
    return { success: true, message: response.data.message || "Thêm vào nhóm thành công" };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Lỗi thêm vào nhóm" };
  }
};

// Hàm xóa sinh viên (Đã fix lỗi DELETE gửi body)
export const removeMemberFromGroup = async (studentId, groupId) => {
  try {
    const response = await api.delete('/kick/kick-student', {
      data: { id_sinh_vien: studentId, id_nhom: groupId }
    });
    return { success: true, message: response.data.message || "Xóa sinh viên khỏi nhóm thành công." };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Lỗi khi xóa sinh viên" };
  }
};


// =========================================================
// 6. XỬ LÝ YÊU CẦU CHUYỂN NHÓM
// =========================================================

export const fetchTransferRequests = async (classId) => {
  try {
    const response = await api.get(`/classes/${classId}/group-change-requests`);
    const requests = response.data || [];
    return requests.map(req => ({
      id: req.id_yeu_cau,
      name: req.ho_ten,
      oldGroup: req.ten_nhom_cu,
      targetGroup: req.ten_nhom_moi,
      reason: req.ly_do,
      mssv: req.mssv 
    }));
  } catch (error) {
    console.error("Lỗi lấy yêu cầu chuyển nhóm:", error);
    return [];
  }
};

export const fetchPendingTransferCount = async (classId) => {
  try {
    const response = await api.get(`/classes/${classId}/group-change-requests/pending-count`);
    return response.data.pending_count || 0;
  } catch (error) {
    return 0;
  }
};

export const acceptTransferRequest = async (requestId) => {
  try {
    const response = await api.patch(`/group-change-requests/${requestId}/approve`);
    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Lỗi khi duyệt" };
  }
};

export const rejectTransferRequest = async (requestId) => {
  try {
    const response = await api.patch(`/group-change-requests/${requestId}/reject`);
    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Lỗi khi từ chối" };
  }
};


// =========================================================
// 7. LỊCH LÀM VIỆC (CALENDAR)
// =========================================================

export const fetchCalendarClasses = async () => {
  try {
    const response = await api.get('/calendar/classes');
    return response.data.classes || []; 
  } catch (error) {
    console.error("Lỗi lấy danh sách lớp cho lịch:", error);
    return [];
  }
};

export const fetchMonthEvents = async (year, month, classId = null) => {
  try {
    let url = `/calendar/month-events?year=${year}&month=${month}`;
    if (classId) url += `&classId=${classId}`;
    
    const response = await api.get(url);
    return response.data.daysWithEvents || [];
  } catch (error) {
    return [];
  }
};

export const fetchDayEvents = async (dateStr, classId = null) => {
  try {
    let url = `/calendar/day-events?date=${dateStr}`;
    if (classId) url += `&classId=${classId}`;
    
    const response = await api.get(url);
    const beEvents = response.data.events || [];
    return beEvents.map(item => ({
      id: item.id_su_kien,
      date: item.ngay,                     
      time: item.gio,                      
      fullDate: item.ngay_hien_thi,        
      content: item.noi_dung,              
      className: item.ten_lop              
    }));
  } catch (error) {
    return [];
  }
};


// =========================================================
// 8. CÀI ĐẶT TÀI KHOẢN (SETTINGS)
// =========================================================

export const fetchUserProfile = async () => {
  try {
    const userStr = localStorage.getItem("stu_user");
    if (!userStr) return { name: "", email: "", faculty: "" };
    const user = JSON.parse(userStr);

    const response = await api.get(`/lecturers/${user.id}`);
    const data = response.data.lecturer || response.data; 

    return {
      name: data.ho_ten || user.ho_ten,
      email: data.email || user.email,
      faculty: data.ten_khoa || "Công nghệ thông tin" 
    };
  } catch (error) {
    const userStr = localStorage.getItem("stu_user");
    const user = userStr ? JSON.parse(userStr) : {};
    return { name: user.ho_ten || "Chưa cập nhật", email: user.email || "Chưa cập nhật", faculty: "Công nghệ thông tin" };
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const user = JSON.parse(localStorage.getItem("stu_user"));
    const payload = { ho_ten: userData.name, ten_khoa: userData.faculty };

    const response = await api.patch(`/users/${user.id}/profile`, payload);
    
    const updatedUser = { ...user, ho_ten: userData.name };
    localStorage.setItem("stu_user", JSON.stringify(updatedUser));

    return { success: true, message: response.data.message || "Cập nhật thành công!" };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Lỗi cập nhật thông tin" };
  }
};

export const changePassword = async (passwordData) => {
  try {
    const payload = {
      current_password: passwordData.currentPassword, 
      new_password: passwordData.newPassword,
      confirm_password: passwordData.confirmPassword
    };
    const response = await api.patch('/users/change-password', payload);
    
    return { 
      success: true, 
      message: response.data.message,          
      forceLogout: response.data.force_logout  
    };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Lỗi khi đổi mật khẩu" };
  }
};


// =========================================================
// 9. MOCK DATA (GIỮ LẠI ĐỂ KHÔNG BỊ CRASH TRANG GROUP DETAIL)
// =========================================================

export const fetchGroupMembers = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/students`);
    
    // ĐÃ SỬA: Chui vào đúng 2 lớp (data -> students) theo y hệt ảnh Postman
    const members = response.data?.data?.students || [];
    
    return members.map(m => ({
      id: m.id_sinh_vien,
      mssv: m.mssv,
      name: m.ho_ten,
      email: m.email,
      role: m.vai_tro_noi_bo,
      joinDate: m.ngay_gia_nhap
    }));
  } catch (error) {
    console.error("Lỗi lấy danh sách thành viên:", error);
    return [];
  }
};
export const fetchGroupMessages = async () => {
  return new Promise((resolve) => setTimeout(() => resolve([]), 500));
};
export const fetchGroupDocs = async () => {
  return new Promise((resolve) => setTimeout(() => resolve([]), 500));
};
export const submitGroupReport = async (reportId, file) => {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
};
export const fetchGroupReports = async () => {
  return new Promise((resolve) => setTimeout(() => resolve([]), 500));
};
export const createReportRequest = async (reportData) => {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
};