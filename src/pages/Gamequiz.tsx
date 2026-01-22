import React from "react";

// Import ให้ตรงกับชื่อไฟล์ข้อ 2
import TankGame from "@/components/games/TankGame"; 
// Import ให้ตรงกับ path ไฟล์ข้อ 1 (ปรับ path ตามจริงของคุณได้เลย)
import { StatsBar, RoundBadge } from "@/components/games/GameHUD";

export default function App() {
  return (
    
    // 1. พื้นหลังสีขาว เต็มจอ
    <div className="min-h-screen bg-slate-50 py-8 flex flex-col items-center overflow-x-hidden">
      


      {/* 2. Stats Bar วางข้างบน */}
      <StatsBar />

      {/* 3. พื้นที่วางเกม + Badge */}
      <div className="relative mt-6 px-4">
        
        {/* Badge วางซ้อนมุมขวาบน (ใน GameHUD ผมตั้งเป็น absolute ไว้แล้ว) */}
        <RoundBadge />

        {/* ตัวเกม */}
        <TankGame />
        
      </div>

    </div>
  );
}