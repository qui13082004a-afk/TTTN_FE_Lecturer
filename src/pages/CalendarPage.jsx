// File: src/pages/CalendarPage.jsx
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
// 1. IMPORT 3 HÀM API MỚI VÀO
import { fetchCalendarClasses, fetchMonthEvents, fetchDayEvents } from "../services/api";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function CalendarPage() {
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // STATE ĐỂ HỨNG DỮ LIỆU TỪ 3 API KHÁC NHAU
  const [classesList, setClassesList] = useState([]);       // Dữ liệu cho Dropdown
  const [monthEventDays, setMonthEventDays] = useState([]); // Mảng chứa các ngày có chấm đỏ
  const [dayEvents, setDayEvents] = useState([]);           // Chi tiết sự kiện của ngày được chọn
  
  // TÁCH STATE LOADING ĐỂ UI MƯỢT HƠN
  const [isLoadingMonth, setIsLoadingMonth] = useState(true);
  const [isLoadingDay, setIsLoadingDay] = useState(true);

  // Mặc định rỗng "" nghĩa là "Tất cả các lớp"
  const [selectedClass, setSelectedClass] = useState(""); 
  const [selectedDate, setSelectedDate] = useState(todayString); 
  const [currentViewDate, setCurrentViewDate] = useState(new Date()); 

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  // --- API 1: LẤY DANH SÁCH LỚP CHO DROPDOWN (Chạy 1 lần duy nhất) ---
  useEffect(() => {
    const loadClasses = async () => {
      const data = await fetchCalendarClasses();
      setClassesList(data);
    };
    loadClasses();
  }, []);

  // --- API 2: LẤY CHẤM ĐỎ TRÊN LỊCH (Chạy khi đổi Tháng/Năm hoặc đổi Bộ lọc lớp) ---
  useEffect(() => {
    const loadMonthEvents = async () => {
      setIsLoadingMonth(true);
      // API Backend thường nhận tháng từ 1-12 nên ta cộng 1
      const apiMonth = month + 1; 
      const classId = selectedClass !== "" ? selectedClass : null;
      
      const days = await fetchMonthEvents(year, apiMonth, classId);
      setMonthEventDays(days);
      setIsLoadingMonth(false);
    };
    loadMonthEvents();
  }, [year, month, selectedClass]);

  // --- API 3: LẤY CHI TIẾT SỰ KIỆN CỦA 1 NGÀY (Chạy khi Click ngày hoặc đổi Bộ lọc lớp) ---
  useEffect(() => {
    const loadDayEvents = async () => {
      setIsLoadingDay(true);
      const classId = selectedClass !== "" ? selectedClass : null;
      
      const events = await fetchDayEvents(selectedDate, classId);
      setDayEvents(events);
      setIsLoadingDay(false);
    };
    loadDayEvents();
  }, [selectedDate, selectedClass]);


  // ==================== LOGIC VẼ LỊCH ====================
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate(); 
  const daysInPrevMonth = new Date(year, month, 0).getDate(); 

  const calendarDays = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, monthOffset: -1 });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, monthOffset: 0 });
  }
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({ day: i, monthOffset: 1 });
  }

  const handlePrevMonth = () => setCurrentViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentViewDate(new Date(year, month + 1, 1));

  const handleDayClick = (item) => {
    let newMonth = month + item.monthOffset;
    let newYear = year;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }

    const formattedDate = `${newYear}-${String(newMonth + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
    setSelectedDate(formattedDate);

    if (item.monthOffset !== 0) setCurrentViewDate(new Date(newYear, newMonth, 1));
  };

  // Logic kiểm tra chấm đỏ giờ cực kỳ nhẹ, chỉ cần dò trong mảng API trả về
  const hasEvent = (item) => {
    let checkMonth = month + item.monthOffset;
    let checkYear = year;
    if (checkMonth < 0) { checkMonth = 11; checkYear--; }
    if (checkMonth > 11) { checkMonth = 0; checkYear++; }
    
    const dateString = `${checkYear}-${String(checkMonth + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
    return monthEventDays.includes(dateString);
  };

  return (
    <div className="p-8 h-full bg-white">
      <h2 className="text-2xl font-bold mb-8 text-gray-900 uppercase tracking-wide">Lịch làm việc</h2>

      {/* DROPDOWN CHỌN LỚP (Render động từ API) */}
      <div className="relative w-52 mb-10">
        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full appearance-none bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-red-500 cursor-pointer"
        >
          <option value="">Tất cả các lớp</option>
          {classesList.map(cls => (
            // Dựa vào format FE chuẩn, id_lop và ten_lop là key thường gặp
            <option key={cls.id_lop} value={cls.id_lop}>{cls.ten_lop}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* KHỐI TRÁI: BỘ LỊCH ĐỘNG */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 w-[320px] shadow-sm shrink-0 select-none relative">
          
          {isLoadingMonth && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-3xl">
              <Loader2 className="animate-spin text-red-500" size={32} />
            </div>
          )}

          <div className="flex items-center justify-between mb-6 px-2">
            <button onClick={handlePrevMonth} className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"><ChevronLeft size={20} /></button>
            <div className="flex gap-2">
              <span className="font-bold text-gray-800 text-base">{MONTH_NAMES[month]}</span>
              <span className="font-bold text-gray-800 text-base">{year}</span>
            </div>
            <button onClick={handleNextMonth} className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"><ChevronRight size={20} /></button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 mb-4">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-y-3 text-center text-sm">
            {calendarDays.map((item, index) => {
              
              let thisItemMonth = month + item.monthOffset;
              let thisItemYear = year;
              if (thisItemMonth < 0) { thisItemMonth = 11; thisItemYear--; }
              if (thisItemMonth > 11) { thisItemMonth = 0; thisItemYear++; }
              const thisItemDateString = `${thisItemYear}-${String(thisItemMonth + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
              
              const isToday = todayString === thisItemDateString;
              const isSelected = selectedDate === thisItemDateString;
              const isEventDay = hasEvent(item);

              return (
                <div key={index} className="relative flex justify-center items-center h-8">
                  <span 
                    onClick={() => handleDayClick(item)}
                    className={`
                      w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors
                      ${item.monthOffset !== 0 ? "text-gray-300" : "text-gray-700"}
                      ${isSelected ? "bg-red-600 !text-white shadow-md font-bold" : "hover:bg-gray-100"}
                      ${isToday && !isSelected ? "border-2 border-red-600 text-red-600 font-bold" : ""} 
                      ${isEventDay && !isSelected && !isToday ? "bg-[#2d2d2d] !text-white hover:bg-black" : ""}
                    `}
                  >
                    {item.day}
                  </span>
                  
                  {isEventDay && (
                    <div className={`absolute top-0 right-1 w-1.5 h-1.5 rounded-full border-[1.5px] border-white ${isSelected ? "bg-white" : "bg-red-600"}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* KHỐI PHẢI: CHI TIẾT SỰ KIỆN ĐỘNG */}
        <div className="flex-1 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm w-full min-h-[380px] relative">
          <div className="text-center py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800 text-lg">Chi tiết sự kiện</h3>
          </div>
          
          <div className="p-6 space-y-4">
            {isLoadingDay ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="animate-spin text-red-400 mb-2" size={28} />
                <p className="italic text-sm">Đang tải sự kiện...</p>
              </div>
            ) : dayEvents.length > 0 ? (
              dayEvents.map(ev => (
                <div key={ev.id} className="text-[15px] text-gray-800 leading-relaxed font-medium bg-gray-50 border border-gray-100 p-4 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <span className="font-bold text-red-600 mr-2">{ev.time}</span> 
                  <span className="font-bold text-gray-500 mr-2">{ev.fullDate}</span> 
                  <br className="block md:hidden"/>
                  {ev.content}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="italic">Không có sự kiện nào cho lớp và ngày bạn đã chọn.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}