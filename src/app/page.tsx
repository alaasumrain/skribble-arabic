"use client";

import Link from "next/link";
import { useState } from "react";
import { Play, Users, Settings, HelpCircle, Newspaper, Gamepad2 } from "lucide-react";

const AVATARS = [
  "🧑‍🎨", "👩‍🎨", "🧑‍💼", "👩‍💼", "🧑‍🎓", "👩‍🎓", "🧑‍🔬", "👩‍🔬"
];

const AVATAR_COLORS = [
  "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", 
  "bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500"
];

export default function Home() {
  const [playerName, setPlayerName] = useState("لاعب");
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden" dir="rtl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M10 10h10v10H10V10zm20 0h10v10H30V10zm0 20h10v10H30V30zM10 30h10v10H10V30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        
        {/* Game Logo */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black mb-4 drop-shadow-lg">
            <span className="text-red-400">س</span>
            <span className="text-orange-400">ك</span>
            <span className="text-yellow-400">ر</span>
            <span className="text-green-400">ي</span>
            <span className="text-blue-400">ب</span>
            <span className="text-indigo-400">ل</span>
            <span className="text-purple-400">.</span>
            <span className="text-pink-400">ع</span>
            <span className="text-red-400">ر</span>
            <span className="text-orange-400">ب</span>
            <span className="text-yellow-400">ي</span>
            <span className="text-green-400">!</span>
          </h1>
        </div>

        {/* Avatar Selection */}
        <div className="flex justify-center gap-2 mb-6">
          {AVATARS.map((avatar, index) => (
            <button
              key={index}
              onClick={() => setSelectedAvatar(index)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 ${
                AVATAR_COLORS[index]
              } ${
                selectedAvatar === index 
                  ? "ring-4 ring-white ring-opacity-80 scale-110" 
                  : "hover:ring-2 hover:ring-white hover:ring-opacity-60"
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>

        {/* Main Game Interface */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md w-full">
          
                     {/* Player Name Input */}
           <div className="mb-4">
             <input
               type="text"
               value={playerName}
               onChange={(e) => setPlayerName(e.target.value)}
               className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-center font-semibold bg-white text-gray-800 placeholder-gray-500"
               placeholder="اسم اللاعب"
             />
           </div>

                     {/* Language Selector */}
           <div className="mb-6">
             <select className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none bg-white text-gray-800 font-semibold text-center">
               <option value="ar">العربية</option>
               <option value="en">English</option>
               <option value="fr">Français</option>
             </select>
           </div>

          {/* Selected Avatar Display */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl ${AVATAR_COLORS[selectedAvatar]} shadow-lg`}>
                {AVATARS[selectedAvatar]}
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-full blur opacity-30 animate-pulse"></div>
            </div>
          </div>

          {/* Play Buttons */}
          <div className="space-y-3">
            <Link
              href="/game"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl font-bold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" />
              العب منفرداً
            </Link>
            
            <Link
              href="/multiplayer"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <Users className="w-5 h-5" />
              لعب متعدد اللاعبين
            </Link>
          </div>
        </div>

        {/* Bottom Info Sections */}
        <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-6xl w-full">
          
                     {/* About */}
           <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20">
             <div className="flex items-center gap-3 mb-4">
               <HelpCircle className="w-8 h-8 text-yellow-400" />
               <h3 className="text-xl font-bold">حول اللعبة</h3>
             </div>
             <p className="text-sm leading-relaxed text-gray-100">
               سكريبل عربي هي لعبة رسم وتخمين جماعية مجانية على الإنترنت.
             </p>
             <p className="text-sm leading-relaxed mt-2 text-gray-100">
               تتكون اللعبة من عدة جولات، حيث يرسم كل لاعب كلمة مختارة والآخرون يحاولون تخمينها لكسب النقاط!
             </p>
             <p className="text-sm leading-relaxed mt-2 text-gray-100">
               الشخص الذي يحصل على أكثر النقاط في نهاية اللعبة، سيتوج كفائز!
             </p>
           </div>

           {/* News */}
           <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20">
             <div className="flex items-center gap-3 mb-4">
               <Newspaper className="w-8 h-8 text-green-400" />
               <h3 className="text-xl font-bold">آخر الأخبار</h3>
             </div>
             <div className="space-y-3">
               <div>
                 <div className="text-xs text-gray-200 mb-1">13 يونيو 2024</div>
                 <div className="text-sm font-semibold text-gray-100">إطلاق النسخة العربية!</div>
                 <ul className="text-xs text-gray-200 mt-1 space-y-1">
                   <li>• واجهة باللغة العربية بالكامل</li>
                   <li>• دعم الكتابة من اليمين لليسار</li>
                   <li>• كلمات عربية متنوعة</li>
                   <li>• تصميم محسن للأجهزة المحمولة</li>
                 </ul>
               </div>
             </div>
           </div>

           {/* How to Play */}
           <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20">
             <div className="flex items-center gap-3 mb-4">
               <Gamepad2 className="w-8 h-8 text-purple-400" />
               <h3 className="text-xl font-bold">كيف تلعب</h3>
             </div>
             <div className="text-center">
               <div className="w-20 h-20 bg-white/25 rounded-full flex items-center justify-center mx-auto mb-4">
                 <div className="text-3xl">🏆</div>
               </div>
               <div className="text-lg font-bold mb-2">الفائز</div>
               <div className="text-sm text-gray-200">
                 اجمع أكبر عدد من النقاط لتصبح الفائز!
               </div>
             </div>
           </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white/60 text-sm">
          © 2024 سكريبل عربي - لعبة الرسم والتخمين الجماعية
        </div>
      </div>
    </div>
  );
}
