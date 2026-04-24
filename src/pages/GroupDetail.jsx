// File: src/pages/GroupDetail.jsx
import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Search, FileText, Trash2, Crown, User, X, Download, Loader2, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import RemoveMemberModal from "../components/RemoveMemberModal";

import { fetchGroupMembers, fetchGroupMessages, fetchGroupDocs, fetchGroupReports } from "../services/api";

export default function GroupDetail() {
  const { groupId } = useParams(); 
  const currentGroupId = groupId;
  const location = useLocation();
  const groupName = location.state?.groupName || `Nhóm ${currentGroupId}`;
  
  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [reports, setReports] = useState([]);
  
  const [rightTab, setRightTab] = useState("members"); 

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedMemberName, setSelectedMemberName] = useState("");
  const [activeMemberId, setActiveMemberId] = useState(null);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // --- LẤY DỮ LIỆU ---
  useEffect(() => {
    const loadWorkspaceData = async () => {
      setIsLoading(true);
      try {
        const [membersData, msgsData, docsData, reportsData] = await Promise.all([
          fetchGroupMembers(currentGroupId), 
          fetchGroupMessages(), 
          fetchGroupDocs(), 
          fetchGroupReports()
        ]);
        
        setMembers(membersData || []); 
        setMessages(msgsData || []); 
        setSharedDocs(docsData || []); 
        setReports(reportsData || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu nhóm:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentGroupId) {
      loadWorkspaceData();
    }
  }, [currentGroupId]);

  // --- XỬ LÝ SỰ KIỆN THÀNH VIÊN ---
  const toggleMemberActions = (id) => activeMemberId === id ? setActiveMemberId(null) : setActiveMemberId(id);
  const handlePromoteToLeader = (id, e) => { e.stopPropagation(); setMembers(members.map(m => ({ ...m, role: m.id === id ? "nhom_truong" : "thanh_vien" }))); setActiveMemberId(null); };
  const handleRemoveClick = (name, e) => { e.stopPropagation(); setSelectedMemberName(name); setIsRemoveModalOpen(true); setActiveMemberId(null); };
  const handleConfirmRemove = (deletedId, newLeaderId) => { let updatedMembers = members.filter(m => m.id !== deletedId); if (newLeaderId) updatedMembers = updatedMembers.map(m => m.id.toString() === newLeaderId ? { ...m, role: "nhom_truong" } : m); setMembers(updatedMembers); };

  // LỌC TIN NHẮN
  const safeMessages = messages || [];
  const filteredMessages = safeMessages.filter(msg => msg?.text?.toLowerCase().includes(searchQuery.toLowerCase()) || msg?.sender?.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const renderMessageText = (text) => {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => part.match(urlRegex) ? <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="underline text-blue-100 hover:text-white font-medium transition-colors">{part}</a> : part);
  };

  const formatDateTime = (dateString) => {
    if(!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString; 
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth()+1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center h-[80vh] text-gray-500"><Loader2 className="animate-spin text-red-500 mb-4" size={40} /><p>Đang tải Không gian làm việc nhóm...</p></div>;

  return (
    <div className="p-8">
      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl text-gray-400 font-medium flex gap-2 items-center">
          <button onClick={() => window.history.back()} className="hover:text-red-600 transition-colors mr-2 p-1" title="Quay lại"><ArrowLeft size={24} /></button>
          <span className="text-gray-800 font-bold">Không gian làm việc của {groupName}</span>
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-6 items-start">
        {/* KHU VỰC CHAT BÊN TRÁI */}
        <div className="bg-white border border-gray-300 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[650px]">
          <div className="flex justify-end gap-3 p-4 border-b border-gray-200 text-gray-800 shrink-0">
            <button onClick={() => { setIsSearchOpen(!isSearchOpen); setSearchQuery(""); }} className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100 hover:text-gray-800'}`} title="Tìm kiếm tin nhắn"><Search size={22} /></button>
            <button onClick={() => setIsDocModalOpen(true)} className="p-2 rounded-full hover:bg-gray-100 hover:text-gray-800 transition-colors" title="Tài liệu & Link chung"><FileText size={22} /></button>
          </div>
          {isSearchOpen && (
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 animate-in fade-in slide-in-from-top-2 shrink-0">
              <div className="relative">
                <input type="text" placeholder="Nhập nội dung cần tìm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 text-sm" autoFocus />
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500"><X size={16} /></button>}
              </div>
            </div>
          )}
          <div className="flex-1 p-6 overflow-y-auto space-y-2 pb-10 bg-gray-50">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <div key={msg.id}>
                  {!msg.isConsecutive && msg.time && <div className="text-center text-xs text-gray-500 mb-4 mt-8">{msg.time}</div>}
                  <div className="flex gap-3">
                    {!msg.isConsecutive ? <div className={`w-10 h-10 ${msg.avatarBg || 'bg-gray-400'} rounded-full flex items-center justify-center text-white shrink-0 mt-1`}><User size={24} /></div> : <div className="w-10 shrink-0"></div>}
                    <div>
                      {!msg.isConsecutive && <p className="text-sm font-bold text-gray-800 mb-1 ml-1">{msg.sender}</p>}
                      <div className={`bg-[#0b57d0] text-white p-3 max-w-xl text-[15px] shadow-sm whitespace-pre-wrap ${msg.text?.includes('http') ? 'break-all' : ''} ${!msg.isConsecutive ? 'rounded-2xl rounded-tl-none' : 'rounded-2xl mt-1'}`}>
                        {renderMessageText(msg.text)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : <div className="text-center text-gray-400 italic py-10">Chưa có tin nhắn nào trong nhóm.</div>}
          </div>
        </div>

        {/* CỘT PHẢI: QUẢN LÝ THÀNH VIÊN & BÁO CÁO */}
        <div className="bg-white border border-gray-300 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[650px]">
          <div className="flex border-b border-gray-200 shrink-0">
            <button onClick={() => setRightTab("members")} className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${rightTab === "members" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>Thành viên ({members.length})</button>
            <button onClick={() => setRightTab("reports")} className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${rightTab === "reports" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>Báo cáo tiến độ</button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {/* TAB THÀNH VIÊN */}
            {rightTab === "members" && (
              <div className="animate-in fade-in duration-300 space-y-4">
                {members.length > 0 ? members.map((member) => (
                  <div key={member.id} className="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex items-center gap-3 cursor-pointer group select-none" onClick={() => toggleMemberActions(member.id)}>
                      <div className={`w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0`}><User size={20}/></div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-800 group-hover:text-red-600 transition-colors block truncate">{member.name}</span>
                        <span className="text-xs text-gray-500 block truncate">{member.mssv} - {member.email}</span>
                      </div>
                      {(member.role === "leader" || member.role === "nhom_truong") && <Crown size={22} className="text-yellow-500 fill-yellow-500 shrink-0" />}
                      
                      {/* CÁC NÚT THAO TÁC THÀNH VIÊN (Mặc định hiện cho Giảng viên) */}
                      {activeMemberId === member.id && (
                        <div className="flex gap-2 ml-auto pl-2 animate-in fade-in slide-in-from-left-2 duration-200">
                          {member.role !== "nhom_truong" && member.role !== "leader" && <button onClick={(e) => handlePromoteToLeader(member.id, e)} className="bg-yellow-50 hover:bg-yellow-100 p-1.5 rounded-lg border border-yellow-200" title="Bổ nhiệm Trưởng nhóm"><Crown size={16} className="text-yellow-600" /></button>}
                          <button onClick={(e) => handleRemoveClick(member.name, e)} className="bg-red-50 hover:bg-red-100 p-1.5 rounded-lg border border-red-200" title="Xóa khỏi nhóm"><Trash2 size={16} className="text-red-500" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-400 italic mt-10">Nhóm chưa có thành viên nào.</p>
                )}
              </div>
            )}

            {/* TAB BÁO CÁO TIẾN ĐỘ */}
            {rightTab === "reports" && (
              <div className="animate-in fade-in duration-300 flex flex-col h-full">
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium p-3 rounded-xl mb-6">
                  Mẹo: Giảng viên giao task chung cho các nhóm tại màn hình <b>Quản lý nhóm</b>. Tại đây, Giảng viên chỉ xem và tải báo cáo.
                </div>
                <div className="space-y-4 flex-1">
                  {reports.length > 0 ? reports.map(report => (
                    <div key={report.id} className="border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-colors shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-800">{report.title}</h4>
                        {report.status === "submitted" ? (
                           <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle2 size={12}/> Đã nộp</span>
                        ) : (
                           <span className="bg-yellow-100 text-yellow-700 text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1"><Clock size={12}/> Chờ nộp</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1 mt-3">
                        <p>Hạn chót: <span className="font-bold text-gray-700">{formatDateTime(report.deadline)}</span></p>
                        
                        {report.status === "submitted" && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p>Nộp lúc: {report.submitTime}</p>
                            <a href="#" className="flex items-center gap-2 mt-2 p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group w-full">
                              <div className="bg-red-100 text-red-600 p-1.5 rounded-md"><FileText size={16}/></div>
                              <span className="font-medium text-gray-700 truncate flex-1 group-hover:text-red-600 transition-colors">{report.fileName}</span>
                              <Download size={16} className="text-gray-400 group-hover:text-red-600"/>
                            </a>
                          </div>
                        )}
                        
                        {report.status === "pending" && (
                          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
                             <p className="text-red-500 italic font-medium flex items-center gap-1"><Clock size={14}/> Nhóm chưa nộp báo cáo.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-gray-400 italic mt-10">Chưa có yêu cầu báo cáo nào.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isRemoveModalOpen && (
        <RemoveMemberModal 
          isOpen={isRemoveModalOpen} 
          onClose={() => setIsRemoveModalOpen(false)} 
          memberName={selectedMemberName} 
          allMembers={members} 
          onConfirm={handleConfirmRemove}
          groupId={currentGroupId} 
        />
      )}

      {isDocModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
           <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl">
            <button onClick={() => setIsDocModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500"><X size={24} /></button>
            <h2 className="text-xl font-bold text-gray-900 mb-6"><FileText className="inline text-red-600 mr-2" size={24} />Tài liệu chung</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {sharedDocs.length > 0 ? sharedDocs.map((doc) => (
                <div key={doc.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50">{doc.title}</div>
              )) : (
                <p className="text-center text-gray-400 italic">Chưa có tài liệu nào.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}