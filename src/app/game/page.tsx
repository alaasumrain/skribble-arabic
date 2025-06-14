"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Palette, 
  Eraser, 
  RotateCcw, 
  Users, 
  MessageCircle, 
  Clock,
  Crown,
  Star,
  Send,
  Undo
} from "lucide-react";

// Mock data for development
const MOCK_PLAYERS = [
  { id: 1, name: "أحمد", score: 150, isDrawing: true },
  { id: 2, name: "فاطمة", score: 120, isDrawing: false },
  { id: 3, name: "محمد", score: 90, isDrawing: false },
  { id: 4, name: "عائشة", score: 75, isDrawing: false },
];

const MOCK_WORDS = ["قطة", "شمس", "بيت", "سيارة", "شجرة", "طائر"];

const COLORS = [
  "#000000", "#FF0000", "#00FF00", "#0000FF", 
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500",
  "#800080", "#FFC0CB", "#A52A2A", "#808080"
];

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawingState] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [currentWord, setCurrentWord] = useState("قطة");
  const [timeLeft, setTimeLeft] = useState(57);
  const [isPlayerDrawing] = useState(true);
  const [isErasing, setIsErasing] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { player: "أحمد", message: "أهلاً بالجميع!", timestamp: Date.now() },
    { player: "فاطمة", message: "بالتوفيق!", timestamp: Date.now() },
  ]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;
    
    const context = canvas.getContext("2d");
    if (!context) return;

    context.lineCap = "round";
    context.strokeStyle = selectedColor;
    context.lineWidth = brushSize;
    contextRef.current = context;

    // Fill with white background
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Load saved drawing from localStorage
    const savedDrawing = localStorage.getItem("skribble-drawing");
    if (savedDrawing) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
      };
      img.src = savedDrawing;
    }
  }, []);

  // Update brush settings
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = isErasing ? "#FFFFFF" : selectedColor;
      contextRef.current.lineWidth = brushSize;
    }
  }, [selectedColor, brushSize, isErasing]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Switch to next player
          const nextWord = MOCK_WORDS[Math.floor(Math.random() * MOCK_WORDS.length)];
          setCurrentWord(nextWord);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in event) {
      // Touch event
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPlayerDrawing) return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Save current state for undo
    const imageData = canvas.toDataURL();
    setUndoStack(prev => [...prev.slice(-9), imageData]); // Keep last 10 states

    const { x, y } = getCoordinates(event);

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawingState(true);
    
    event.preventDefault(); // Prevent scrolling on touch
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isPlayerDrawing) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const { x, y } = getCoordinates(event);

    context.lineTo(x, y);
    context.stroke();
    
    event.preventDefault(); // Prevent scrolling on touch
  };

  const stopDrawing = () => {
    if (!isPlayerDrawing) return;
    setIsDrawingState(false);
    
    // Save drawing to localStorage
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      localStorage.setItem("skribble-drawing", dataURL);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Save current state for undo before clearing
    const imageData = canvas.toDataURL();
    setUndoStack(prev => [...prev.slice(-9), imageData]);

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear saved drawing
    localStorage.removeItem("skribble-drawing");
  };

  const undoLastAction = () => {
    if (undoStack.length === 0) return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const lastState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));

    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
    };
    img.src = lastState;
  };

  const toggleEraser = () => {
    setIsErasing(!isErasing);
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      setChatHistory(prev => [...prev, {
        player: "أنت",
        message: chatMessage,
        timestamp: Date.now()
      }]);
      setChatMessage("");
    }
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Palette className="w-6 h-6" />
            سكريبل عربي
          </h1>
          
          {/* Game Timer & Word */}
          <div className="flex items-center gap-4">
            <div className="bg-red-500/80 text-white px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm">
              <Clock className="w-5 h-5" />
              <span className="font-bold text-xl">{timeLeft}s</span>
            </div>
            
            {/* Current Word (for drawer) */}
            {isPlayerDrawing && (
              <div className="bg-blue-500/80 text-white px-4 py-2 rounded-xl backdrop-blur-sm">
                <span className="font-bold">ارسم: {currentWord}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="relative z-10 flex gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Players Panel */}
        <div className="w-64 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            اللاعبون ({MOCK_PLAYERS.length})
          </h3>
          
          <div className="space-y-3">
            {MOCK_PLAYERS.map((player, index) => (
              <div 
                key={player.id} 
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  player.isDrawing ? "bg-yellow-400/20 border-2 border-yellow-400/50" : "bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                  {player.isDrawing && <Palette className="w-4 h-4 text-yellow-400" />}
                  <span className="font-medium text-white">{player.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold text-white">{player.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drawing Canvas */}
        <div className="flex-1 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20">
          {/* Drawing Tools */}
          {isPlayerDrawing && (
            <div className="border-b border-white/20 p-4">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Colors */}
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedColor === color ? "border-white ring-2 ring-white/50" : "border-white/30"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Brush Size */}
                <div className="flex items-center gap-2 text-white">
                  <span className="text-sm">حجم الفرشاة:</span>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-20 accent-white"
                  />
                  <span className="text-sm w-6">{brushSize}</span>
                </div>

                {/* Tools */}
                <div className="flex gap-2">
                  <button
                    onClick={toggleEraser}
                    className={`p-2 rounded-lg transition-all hover:scale-105 ${
                      isErasing ? "bg-red-500/80 text-white" : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                    title="ممحاة"
                  >
                    <Eraser className="w-5 h-5" />
                  </button>
                  <button
                    onClick={undoLastAction}
                    disabled={undoStack.length === 0}
                    className={`p-2 rounded-lg transition-all hover:scale-105 ${
                      undoStack.length === 0 
                        ? "bg-white/10 text-white/50 cursor-not-allowed" 
                        : "bg-white/20 hover:bg-white/30 text-white"
                    }`}
                    title="تراجع"
                  >
                    <Undo className="w-5 h-5" />
                  </button>
                  <button
                    onClick={clearCanvas}
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all hover:scale-105"
                    title="مسح الكل"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Canvas */}
          <div className="p-4 flex justify-center">
            <div className="border-2 border-white/30 rounded-lg overflow-hidden bg-white">
              <canvas 
                ref={canvasRef}
                className="block cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          </div>

          {/* Word Hints (for guessers) */}
          {!isPlayerDrawing && (
            <div className="border-t border-white/20 p-4 text-center">
              <div className="text-lg font-semibold text-white">
                الكلمة: {"_".repeat(currentWord.length).split("").join(" ")}
              </div>
              <div className="text-sm text-white/70 mt-2">
                ({currentWord.length} حروف)
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <div className="w-80 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col">
          <div className="p-4 border-b border-white/20">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
              <MessageCircle className="w-5 h-5" />
              الدردشة
            </h3>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-3 max-h-96 overflow-y-auto">
            {chatHistory.map((msg, index) => (
              <div key={index} className="text-sm">
                <span className="font-semibold text-yellow-400">{msg.player}:</span>
                <span className="mr-2 text-white">{msg.message}</span>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="border-t border-white/20 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="اكتب تخمينك هنا..."
                className="flex-1 px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white/90 text-gray-800 placeholder-gray-500"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-green-500/80 hover:bg-green-600/80 text-white rounded-lg transition-all hover:scale-105"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 