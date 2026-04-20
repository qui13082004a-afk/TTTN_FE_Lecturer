// File: src/pages/Dashboard.jsx

import { useState, useEffect } from "react";
import { Users, AlertTriangle, Clock, MonitorPlay, Loader2 } from "lucide-react";
import StatCard from "../components/StatCard";
import { fetchDashboardData, autoGroupClass } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({ classes: 0, groups: 0, pendingClasses: 0, pendingTasks: 0 });
  const [actionItems, setActionItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleAutoGroup = async (classId) => {
    const res = await autoGroupClass(classId);
    alert(res.message);
    if (res.success) {
       const data = await fetchDashboardData();
       setStats(data.stats);
       setActionItems(data.actionItems);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchDashboardData(); 
      setStats(data.stats);
      setActionItems(data.actionItems);
      setNotifications(data.notifications);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-red-500" size={40} /></div>;

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Bảng điều khiển</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<MonitorPlay size={24} />} title="Lớp đang phụ trách" value={stats.classes} iconColorBg="bg-green-100" iconColorText="text-green-500" />
        <StatCard icon={<Users size={24} />} title="Tổng số nhóm" value={stats.groups} iconColorBg="bg-blue-100" iconColorText="text-blue-500" />
        <StatCard icon={<AlertTriangle size={24} />} title="Lớp cần chốt nhóm" value={stats.pendingClasses} iconColorBg="bg-red-100" iconColorText="text-red-500" />
        <StatCard icon={<Clock size={24} />} title="Task sắp trễ hạn" value={stats.pendingTasks} iconColorBg="bg-yellow-100" iconColorText="text-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
          <div className="p-5 border-b border-gray-100"><h3 className="font-bold text-gray-800">Danh sách việc cần xử lí</h3></div>
          <div className="p-5 flex-1 flex flex-col gap-4">
            {actionItems.map(item => (
              <div key={item.id} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <p className="text-gray-800 font-bold">{item.className}: <span className="font-normal text-gray-600">{item.statusText}</span></p>
                {item.isExpired && item.unassignedCount > 0 ? (
                  <button 
                    onClick={() => handleAutoGroup(item.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Phân nhóm tự động
                  </button>
                ) : (
                  <span className="text-sm text-gray-400 italic">{!item.isExpired ? "Đang mở đăng ký" : "Đã chốt nhóm"}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
          <div className="p-5 border-b border-gray-100"><h3 className="font-bold text-gray-800">Thông báo</h3></div>
          <div className="p-5 space-y-6">
            {notifications.map((noti, index) => (
              <div key={noti.id} className="flex gap-4 relative">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full mt-1.5 shrink-0 relative z-10"></div>
                <div>
                  <p className="font-bold text-gray-800 text-sm leading-snug">{noti.subject}</p>
                  <p className="text-gray-700 text-sm mt-0.5">{noti.action}</p>
                  <p className="text-gray-400 text-xs mt-1.5">{noti.time}</p>
                </div>
                {index !== notifications.length - 1 && <div className="absolute left-[4.5px] top-4 bottom-[-30px] w-[1px] bg-gray-200"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}