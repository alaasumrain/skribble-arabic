"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Users, 
  Clock, 
  Globe, 
  Lock, 
  Play,
  ArrowRight,
  Search,
  Palette
} from "lucide-react";

// Mock rooms data
const MOCK_ROOMS = [
  {
    id: "room1",
    name: "غرفة الأصدقاء",
    players: 4,
    maxPlayers: 8,
    isPrivate: false,
    language: "العربية",
    currentRound: 2,
    totalRounds: 5,
    host: "أحمد",
    status: "playing"
  },
  {
    id: "room2", 
    name: "المبتدئين فقط",
    players: 2,
    maxPlayers: 6,
    isPrivate: false,
    language: "العربية",
    currentRound: 1,
    totalRounds: 3,
    host: "فاطمة",
    status: "waiting"
  },
  {
    id: "room3",
    name: "غرفة VIP",
    players: 6,
    maxPlayers: 10,
    isPrivate: true,
    language: "العربية",
    currentRound: 3,
    totalRounds: 10,
    host: "محمد",
    status: "playing"
  },
];

export default function RoomsPage() {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [isPrivate, setIsPrivate] = useState(false);
  const [roundTime, setRoundTime] = useState(60);
  const [totalRounds, setTotalRounds] = useState(5);

  const filteredRooms = MOCK_ROOMS.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRoom = () => {
    // In a real app, this would make an API call
    console.log("Creating room:", {
      name: roomName,
      maxPlayers,
      isPrivate,
      roundTime,
      totalRounds
    });
    setShowCreateRoom(false);
    // Redirect to game room
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden" dir="rtl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M10 10h10v10H10V10zm20 0h10v10H30V10zm0 20h10v10H30V30zM10 30h10v10H10V30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2 hover:text-yellow-300 transition-colors">
            <Palette className="w-6 h-6" />
            سكريبل عربي
          </Link>
          
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              الرئيسية
            </Link>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إنشاء غرفة
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">غرف اللعب</h1>
          <p className="text-white/80">اختر غرفة للانضمام أو أنشئ غرفة جديدة</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/20">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن الغرف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white/90 text-gray-800 placeholder-gray-500"
              />
            </div>
            <select className="px-4 py-3 border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/90 text-gray-800">
              <option>جميع الغرف</option>
              <option>غرف متاحة</option>
              <option>غرف قيد اللعب</option>
            </select>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="p-6">
                {/* Room Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      {room.isPrivate && <Lock className="w-4 h-4 text-yellow-400" />}
                      {room.name}
                    </h3>
                    <p className="text-sm text-white/70">المضيف: {room.host}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    room.status === "playing" 
                      ? "bg-green-500/80 text-white" 
                      : "bg-yellow-500/80 text-white"
                  }`}>
                    {room.status === "playing" ? "يلعب الآن" : "في الانتظار"}
                  </span>
                </div>

                {/* Room Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm text-white/90">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-white/70" />
                      اللاعبون
                    </span>
                    <span className="font-bold">{room.players}/{room.maxPlayers}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-white/90">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/70" />
                      الجولة
                    </span>
                    <span className="font-bold">{room.currentRound}/{room.totalRounds}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-white/90">
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-white/70" />
                      اللغة
                    </span>
                    <span className="font-bold">{room.language}</span>
                  </div>
                </div>

                {/* Players Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-white/60 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(room.players / room.maxPlayers) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Join Button */}
                <Link 
                  href={`/game?room=${room.id}`}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
                    room.players >= room.maxPlayers 
                      ? "bg-gray-500/50 text-white/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:scale-105 shadow-lg"
                  }`}
                >
                  <Play className="w-4 h-4" />
                  {room.players >= room.maxPlayers ? "الغرفة ممتلئة" : "انضم للغرفة"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
              <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">لا توجد غرف متاحة</h3>
              <p className="text-white/70 mb-4">جرب البحث بكلمات أخرى أو أنشئ غرفة جديدة</p>
              <button
                onClick={() => setShowCreateRoom(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all hover:scale-105"
              >
                إنشاء غرفة جديدة
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">إنشاء غرفة جديدة</h2>
              <button
                onClick={() => setShowCreateRoom(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Room Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اسم الغرفة
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="أدخل اسم الغرفة"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                />
              </div>

              {/* Max Players */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  عدد اللاعبين الأقصى
                </label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                >
                  <option value={4}>4 لاعبين</option>
                  <option value={6}>6 لاعبين</option>
                  <option value={8}>8 لاعبين</option>
                  <option value={10}>10 لاعبين</option>
                  <option value={12}>12 لاعب</option>
                </select>
              </div>

              {/* Privacy */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="private" className="text-sm font-semibold text-gray-700">
                  غرفة خاصة (بكلمة مرور)
                </label>
              </div>

              {/* Round Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  وقت كل جولة (ثانية)
                </label>
                <select
                  value={roundTime}
                  onChange={(e) => setRoundTime(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                >
                  <option value={30}>30 ثانية</option>
                  <option value={60}>60 ثانية</option>
                  <option value={90}>90 ثانية</option>
                  <option value={120}>120 ثانية</option>
                </select>
              </div>

              {/* Total Rounds */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  عدد الجولات
                </label>
                <select
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                >
                  <option value={3}>3 جولات</option>
                  <option value={5}>5 جولات</option>
                  <option value={7}>7 جولات</option>
                  <option value={10}>10 جولات</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateRoom(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={!roomName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 font-semibold"
              >
                <Plus className="w-4 h-4" />
                إنشاء الغرفة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 