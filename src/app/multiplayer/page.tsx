"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
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
  Play,
  Copy,
  Check
} from "lucide-react";

interface Player {
  id: string;
  name: string;
  score: number;
  isDrawing: boolean;
  hasGuessed: boolean;
}

interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  isGuess: boolean;
  isCorrect: boolean;
}

interface DrawingData {
  type: string;
  x?: number;
  y?: number;
  color?: string;
  size?: number;
}

interface GameState {
  id: string;
  players: Player[];
  currentDrawer: string | null;
  currentWord: string | null;
  timeLeft: number;
  round: number;
  maxRounds: number;
  gameStarted: boolean;
  gameEnded: boolean;
  drawingData: DrawingData[];
  chatHistory: ChatMessage[];
}

const COLORS = [
  "#000000", "#FF0000", "#00FF00", "#0000FF", 
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500",
  "#800080", "#FFC0CB", "#A52A2A", "#808080"
];

export default function MultiplayerGamePage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [isErasing, setIsErasing] = useState(false);
  
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    if (socket && gameState?.currentDrawer === socket.id) {
      socket.emit("clear-canvas");
    }
  }, [socket, gameState]);

  const handleRemoteDrawing = useCallback((data: DrawingData) => {
    const context = contextRef.current;
    if (!context) return;

    if (data.color) context.strokeStyle = data.color;
    if (data.size) context.lineWidth = data.size;

    if (data.type === "start" && data.x !== undefined && data.y !== undefined) {
      context.beginPath();
      context.moveTo(data.x, data.y);
    } else if (data.type === "draw" && data.x !== undefined && data.y !== undefined) {
      context.lineTo(data.x, data.y);
      context.stroke();
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnected(true);
      console.log("Connected to server");
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
      console.log("Disconnected from server");
    });

    newSocket.on("room-created", (data) => {
      setRoomId(data.roomId);
      setGameState(data.gameState);
    });

    newSocket.on("player-joined", (gameState) => {
      setGameState(gameState);
    });

    newSocket.on("player-left", (gameState) => {
      setGameState(gameState);
    });

    newSocket.on("game-started", (gameState) => {
      setGameState(gameState);
      clearCanvas();
    });

    newSocket.on("game-update", (gameState) => {
      setGameState(gameState);
    });

    newSocket.on("timer-update", (data) => {
      setGameState(prev => prev ? {...prev, timeLeft: data.timeLeft, round: data.round} : null);
    });

    newSocket.on("drawing-data", (data) => {
      handleRemoteDrawing(data);
    });

    newSocket.on("clear-canvas", () => {
      clearCanvas();
    });

    newSocket.on("chat-message", (message) => {
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          chatHistory: [...prev.chatHistory, message]
        };
      });
    });

    newSocket.on("room-error", (errorMessage) => {
      setError(errorMessage);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [clearCanvas, handleRemoteDrawing]);

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
  }, [brushSize, selectedColor]);

  // Update brush settings
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = isErasing ? "#FFFFFF" : selectedColor;
      contextRef.current.lineWidth = brushSize;
    }
  }, [selectedColor, brushSize, isErasing]);

  const createRoom = () => {
    if (!socket || !playerName.trim()) return;
    socket.emit("create-room", { playerName: playerName.trim() });
  };

  const joinRoom = () => {
    if (!socket || !playerName.trim() || !joinRoomId.trim()) return;
    socket.emit("join-room", { 
      roomId: joinRoomId.trim().toUpperCase(), 
      playerName: playerName.trim() 
    });
    setShowJoinRoom(false);
  };

  const startGame = () => {
    if (!socket) return;
    socket.emit("start-game");
  };

  const copyRoomId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!gameState || !socket || gameState.currentDrawer !== socket.id) return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const { x, y } = getCoordinates(event);

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
    
    // Send drawing data to server
    socket.emit("drawing-data", {
      type: "start",
      x, y,
      color: isErasing ? "#FFFFFF" : selectedColor,
      size: brushSize
    });
    
    event.preventDefault();
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !gameState || !socket || gameState.currentDrawer !== socket.id) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const { x, y } = getCoordinates(event);

    context.lineTo(x, y);
    context.stroke();
    
    // Send drawing data to server
    socket.emit("drawing-data", {
      type: "draw",
      x, y,
      color: isErasing ? "#FFFFFF" : selectedColor,
      size: brushSize
    });
    
    event.preventDefault();
  };

  const stopDrawing = () => {
    if (!gameState || !socket || gameState.currentDrawer !== socket.id) return;
    setIsDrawing(false);
    
    socket.emit("drawing-data", { type: "stop" });
  };

  const sendMessage = () => {
    if (!socket || !chatMessage.trim()) return;
    
    socket.emit("chat-message", { message: chatMessage.trim() });
    setChatMessage("");
  };

  const toggleEraser = () => {
    setIsErasing(!isErasing);
  };

  const isCurrentDrawer = gameState && socket && gameState.currentDrawer === socket.id;
  const currentPlayer = gameState && socket ? gameState.players.find(p => p.id === socket.id) : null;

  // Show room setup if not connected to a room
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden flex items-center justify-center" dir="rtl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M10 10h10v10H10V10zm20 0h10v10H30V10zm0 20h10v10H30V30zM10 30h10v10H10V30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-white text-center mb-8 flex items-center justify-center gap-2">
            <Palette className="w-8 h-8" />
            سكريبل متعدد اللاعبين
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">اسم اللاعب</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="ادخل اسمك..."
                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white/90 text-gray-800"
                maxLength={15}
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={createRoom}
                disabled={!connected || !playerName.trim()}
                className="w-full py-3 px-6 bg-green-500/80 hover:bg-green-600/80 disabled:bg-gray-500/50 text-white font-bold rounded-xl transition-all hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                إنشاء غرفة جديدة
              </button>

              <button
                onClick={() => setShowJoinRoom(true)}
                disabled={!connected || !playerName.trim()}
                className="w-full py-3 px-6 bg-blue-500/80 hover:bg-blue-600/80 disabled:bg-gray-500/50 text-white font-bold rounded-xl transition-all hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                انضمام لغرفة
              </button>
            </div>

            {!connected && (
              <div className="text-red-300 text-center text-sm">
                جاري الاتصال بالخادم...
              </div>
            )}

            {error && (
              <div className="text-red-300 text-center text-sm bg-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>

          {/* Join Room Modal */}
          {showJoinRoom && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 p-6 w-full max-w-sm mx-4">
                <h3 className="text-xl font-bold text-white mb-4">انضمام لغرفة</h3>
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  placeholder="رمز الغرفة..."
                  className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/90 text-gray-800 mb-4"
                  maxLength={6}
                />
                <div className="flex gap-2">
                  <button
                    onClick={joinRoom}
                    className="flex-1 py-2 px-4 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-lg transition-all"
                  >
                    انضمام
                  </button>
                  <button
                    onClick={() => setShowJoinRoom(false)}
                    className="flex-1 py-2 px-4 bg-gray-500/80 hover:bg-gray-600/80 text-white rounded-lg transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
            سكريبل عربي - {roomId}
            <button
              onClick={copyRoomId}
              className="mr-2 p-1 hover:bg-white/20 rounded transition-all"
              title="نسخ رمز الغرفة"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </h1>
          
          {/* Game Status */}
          <div className="flex items-center gap-4">
            {gameState.gameStarted ? (
              <>
                <div className="bg-red-500/80 text-white px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm">
                  <Clock className="w-5 h-5" />
                  <span className="font-bold text-xl">{gameState.timeLeft}s</span>
                </div>
                <div className="bg-purple-500/80 text-white px-4 py-2 rounded-xl backdrop-blur-sm">
                  الجولة {gameState.round}/{gameState.maxRounds}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-white">في انتظار بدء اللعبة...</span>
                {gameState.players.length >= 2 && (
                  <button
                    onClick={startGame}
                    className="px-4 py-2 bg-green-500/80 hover:bg-green-600/80 text-white rounded-xl transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    ابدأ اللعبة
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Game Area */}
      <div className="relative z-10 flex gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Players Panel */}
        <div className="w-64 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            اللاعبون ({gameState.players.length})
          </h3>
          
          <div className="space-y-3">
            {gameState.players.map((player, index) => (
              <div 
                key={player.id} 
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  player.isDrawing ? "bg-yellow-400/20 border-2 border-yellow-400/50" : "bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                  {player.isDrawing && <Palette className="w-4 h-4 text-yellow-400" />}
                  <span className={`font-medium ${currentPlayer?.id === player.id ? 'text-yellow-300' : 'text-white'}`}>
                    {player.name} {currentPlayer?.id === player.id && '(أنت)'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold text-white">{player.score}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Current Word Display */}
          {gameState.gameStarted && (
            <div className="mt-6 p-4 bg-white/10 rounded-xl">
              <h4 className="text-white font-semibold mb-2">الكلمة:</h4>
              {isCurrentDrawer ? (
                <div className="text-yellow-300 font-bold text-lg">{gameState.currentWord}</div>
              ) : (
                <div className="text-white text-lg">
                  {gameState.currentWord ? "_".repeat(gameState.currentWord.length).split("").join(" ") : "..."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawing Canvas */}
        <div className="flex-1 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20">
          {/* Drawing Tools */}
          {isCurrentDrawer && (
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
                className={`block ${isCurrentDrawer ? 'cursor-crosshair' : 'cursor-not-allowed'} touch-none`}
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

          {/* Turn Indicator */}
          {!isCurrentDrawer && gameState.gameStarted && (
            <div className="border-t border-white/20 p-4 text-center">
              <div className="text-lg font-semibold text-white">
                {gameState.players.find(p => p.isDrawing)?.name} يرسم الآن...
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
            {gameState.chatHistory.map((msg, index) => (
              <div key={index} className={`text-sm ${msg.isCorrect ? 'bg-green-500/20 rounded p-2' : ''}`}>
                <span className="font-semibold text-yellow-400">{msg.playerName}:</span>
                <span className={`mr-2 ${msg.isCorrect ? 'text-green-300 font-bold' : 'text-white'}`}>
                  {msg.message}
                  {msg.isCorrect && ' ✓'}
                </span>
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
                placeholder={isCurrentDrawer ? "أرسل رسالة..." : "اكتب تخمينك..."}
                disabled={!gameState.gameStarted}
                className="flex-1 px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white/90 text-gray-800 placeholder-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              />
              <button
                onClick={sendMessage}
                disabled={!chatMessage.trim() || !gameState.gameStarted}
                className="px-4 py-2 bg-green-500/80 hover:bg-green-600/80 disabled:bg-gray-500/50 text-white rounded-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
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