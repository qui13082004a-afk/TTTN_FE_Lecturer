// File: src/components/StatCard.jsx

export default function StatCard({ icon, title, value, iconColorBg, iconColorText }) {
  return (
    // Khung thẻ: viền mờ, bo góc lớn, đổ bóng nhẹ
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      
      {/* Khung chứa Icon có màu nền */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColorBg} ${iconColorText}`}>
        {icon}
      </div>
      
      {/* Chữ và số */}
      <div>
        <p className="text-gray-500 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      
    </div>
  );
}