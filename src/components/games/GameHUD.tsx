import React from "react";
import { Heart, Zap, Target, Clock, ArrowLeft } from "lucide-react";

// --- Stats Bar (แถบค่าสถานะด้านบน) ---
export const StatsBar = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-3 px-6 flex items-center justify-between">
        
        {/* ปุ่ม Back */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700">
          <ArrowLeft size={24} />
        </button>

        {/* ค่าสถานะต่างๆ */}
        <div className="flex items-center gap-4 md:gap-12 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-fit">
            <Heart className="text-red-500 fill-red-500" size={24} />
            <span className="text-xl font-bold text-gray-800">100</span>
          </div>

          <div className="flex items-center gap-2 min-w-fit">
            <Zap className="text-yellow-400 fill-yellow-400" size={24} />
            <span className="text-xl font-bold text-gray-800">13</span>
          </div>

          <div className="flex items-center gap-2 min-w-fit">
            <div className="text-blue-500"><Target size={24} /></div>
            <span className="text-xl font-bold text-gray-800">50</span>
          </div>

          <div className="flex items-center gap-2 min-w-fit">
            <Clock className="text-gray-800" size={24} />
            <span className="text-xl font-bold text-gray-800">0:28</span>
          </div>
        </div>

        {/* ข้อความขวาสุด */}
        <div className="hidden md:block text-lg font-medium text-gray-700">
          Enemies: 10
        </div>
      </div>
    </div>
  );
};

// --- Round Badge (วงกลมมุมขวา 7/10) ---
export const RoundBadge = () => {
  return (
    // ปรับตำแหน่ง absolute ให้ลอยอยู่มุมขวาบนของแมพ
    <div className="absolute -top-6 -right-4 z-10 md:top-4 md:right-4 pointer-events-none">
      <div className="w-20 h-20 bg-white rounded-full border-4 border-blue-50 flex items-center justify-center shadow-lg relative">
        <svg className="absolute w-full h-full -rotate-90 scale-110">
           <circle cx="40" cy="40" r="36" stroke="#e0f2fe" strokeWidth="4" fill="transparent" />
           <circle 
             cx="40" cy="40" r="36" 
             stroke="#3b82f6" strokeWidth="4" fill="transparent" 
             strokeDasharray="226" 
             strokeDashoffset="60" 
             strokeLinecap="round" 
           />
        </svg>
        <span className="text-2xl font-bold text-gray-800">7/10</span>
      </div>
    </div>
  );
};