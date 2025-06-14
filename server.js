const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          "https://skribble-arabic.vercel.app",
          "https://skribble-arabic-alaasumrain.vercel.app",
          "https://skribble-arabic-git-main-alaasumrain.vercel.app"
        ]
      : ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Arabic Skribbl.io Backend is running!',
    timestamp: new Date().toISOString(),
    rooms: rooms.size,
    players: players.size
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Game state
const rooms = new Map();
const players = new Map();

// Arabic words for the game
const ARABIC_WORDS = [
  "قطة", "كلب", "شمس", "قمر", "بيت", "سيارة", "شجرة", "طائر", "سمكة", "زهرة",
  "كتاب", "قلم", "مدرسة", "مستشفى", "طعام", "ماء", "نار", "جبل", "بحر", "صحراء",
  "عين", "أنف", "فم", "يد", "قدم", "رأس", "قلب", "دماغ", "ساعة", "هاتف",
  "حاسوب", "تلفزيون", "باب", "نافذة", "طاولة", "كرسي", "سرير", "مطبخ", "حمام", "حديقة"
];

class GameRoom {
  constructor(id, creatorName) {
    this.id = id;
    this.players = [];
    this.currentDrawer = null;
    this.currentWord = null;
    this.timeLeft = 0;
    this.round = 1;
    this.maxRounds = 3;
    this.gameStarted = false;
    this.gameEnded = false;
    this.timer = null;
    this.drawingData = [];
    this.chatHistory = [];
    
    // Add creator as first player
    this.addPlayer(creatorName, creatorName);
  }

  addPlayer(socketId, name) {
    if (this.players.length >= 8) return false; // Max 8 players
    
    const player = {
      id: socketId,
      name: name,
      score: 0,
      isDrawing: false,
      hasGuessed: false
    };
    
    this.players.push(player);
    return true;
  }

  removePlayer(socketId) {
    this.players = this.players.filter(p => p.id !== socketId);
    if (this.currentDrawer === socketId) {
      this.nextTurn();
    }
  }

  startGame() {
    if (this.players.length < 2) return false;
    
    this.gameStarted = true;
    this.round = 1;
    this.nextTurn();
    return true;
  }

  nextTurn() {
    // Clear previous round state
    this.players.forEach(p => {
      p.isDrawing = false;
      p.hasGuessed = false;
    });
    
    // Find next drawer
    const currentIndex = this.players.findIndex(p => p.id === this.currentDrawer);
    const nextIndex = (currentIndex + 1) % this.players.length;
    
    if (nextIndex === 0 && this.currentDrawer !== null) {
      this.round++;
    }
    
    if (this.round > this.maxRounds) {
      this.endGame();
      return;
    }
    
    this.currentDrawer = this.players[nextIndex].id;
    this.players[nextIndex].isDrawing = true;
    this.currentWord = ARABIC_WORDS[Math.floor(Math.random() * ARABIC_WORDS.length)];
    this.timeLeft = 80; // 80 seconds per turn
    this.drawingData = [];
    
    this.startTimer();
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    
    this.timer = setInterval(() => {
      this.timeLeft--;
      
      if (this.timeLeft <= 0) {
        this.nextTurn();
      }
    }, 1000);
  }

  endGame() {
    this.gameEnded = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    // Sort players by score
    this.players.sort((a, b) => b.score - a.score);
  }

  addChatMessage(playerId, message, isGuess = false) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;

    const chatMessage = {
      playerId,
      playerName: player.name,
      message,
      timestamp: Date.now(),
      isGuess,
      isCorrect: false
    };

    // Check if it's a correct guess
    if (isGuess && this.currentWord && message.trim().toLowerCase() === this.currentWord.toLowerCase()) {
      if (!player.hasGuessed && !player.isDrawing) {
        chatMessage.isCorrect = true;
        player.hasGuessed = true;
        
        // Award points
        const basePoints = Math.max(20, this.timeLeft);
        player.score += basePoints;
        
        // Award points to drawer too
        const drawer = this.players.find(p => p.isDrawing);
        if (drawer) {
          drawer.score += 10;
        }
        
        // Check if all players guessed
        const unguessedPlayers = this.players.filter(p => !p.hasGuessed && !p.isDrawing);
        if (unguessedPlayers.length === 0) {
          setTimeout(() => this.nextTurn(), 2000);
        }
      }
    }

    this.chatHistory.push(chatMessage);
    return chatMessage;
  }

  addDrawingData(data) {
    this.drawingData.push(data);
  }

  getGameState() {
    return {
      id: this.id,
      players: this.players,
      currentDrawer: this.currentDrawer,
      currentWord: this.currentWord,
      timeLeft: this.timeLeft,
      round: this.round,
      maxRounds: this.maxRounds,
      gameStarted: this.gameStarted,
      gameEnded: this.gameEnded,
      drawingData: this.drawingData,
      chatHistory: this.chatHistory.slice(-50) // Last 50 messages
    };
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Create room
  socket.on('create-room', (data) => {
    const roomId = generateRoomCode();
    const room = new GameRoom(roomId, data.playerName);
    rooms.set(roomId, room);
    players.set(socket.id, { roomId, playerName: data.playerName });
    
    socket.join(roomId);
    socket.emit('room-created', { roomId, gameState: room.getGameState() });
  });

  // Join room
  socket.on('join-room', (data) => {
    const room = rooms.get(data.roomId);
    if (!room) {
      socket.emit('room-error', 'الغرفة غير موجودة');
      return;
    }

    if (room.gameStarted) {
      socket.emit('room-error', 'اللعبة بدأت بالفعل');
      return;
    }

    if (!room.addPlayer(socket.id, data.playerName)) {
      socket.emit('room-error', 'الغرفة ممتلئة');
      return;
    }

    players.set(socket.id, { roomId: data.roomId, playerName: data.playerName });
    socket.join(data.roomId);
    
    io.to(data.roomId).emit('player-joined', room.getGameState());
  });

  // Start game
  socket.on('start-game', () => {
    const playerData = players.get(socket.id);
    if (!playerData) return;
    
    const room = rooms.get(playerData.roomId);
    if (!room) return;
    
    if (room.startGame()) {
      io.to(playerData.roomId).emit('game-started', room.getGameState());
    }
  });

  // Drawing data
  socket.on('drawing-data', (data) => {
    const playerData = players.get(socket.id);
    if (!playerData) return;
    
    const room = rooms.get(playerData.roomId);
    if (!room) return;
    
    // Only current drawer can send drawing data
    if (room.currentDrawer === socket.id) {
      room.addDrawingData(data);
      socket.to(playerData.roomId).emit('drawing-data', data);
    }
  });

  // Chat message
  socket.on('chat-message', (data) => {
    const playerData = players.get(socket.id);
    if (!playerData) return;
    
    const room = rooms.get(playerData.roomId);
    if (!room) return;
    
    const chatMessage = room.addChatMessage(socket.id, data.message, true);
    if (chatMessage) {
      io.to(playerData.roomId).emit('chat-message', chatMessage);
      
      // Send updated game state if it was a correct guess
      if (chatMessage.isCorrect) {
        io.to(playerData.roomId).emit('game-update', room.getGameState());
      }
    }
  });

  // Clear canvas
  socket.on('clear-canvas', () => {
    const playerData = players.get(socket.id);
    if (!playerData) return;
    
    const room = rooms.get(playerData.roomId);
    if (!room || room.currentDrawer !== socket.id) return;
    
    room.drawingData = [];
    io.to(playerData.roomId).emit('clear-canvas');
  });

  // Get game state
  socket.on('get-game-state', () => {
    const playerData = players.get(socket.id);
    if (!playerData) return;
    
    const room = rooms.get(playerData.roomId);
    if (!room) return;
    
    socket.emit('game-update', room.getGameState());
  });

  // Timer tick
  setInterval(() => {
    rooms.forEach((room) => {
      if (room.gameStarted && !room.gameEnded) {
        io.to(room.id).emit('timer-update', {
          timeLeft: room.timeLeft,
          round: room.round
        });
      }
    });
  }, 1000);

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    const playerData = players.get(socket.id);
    if (playerData) {
      const room = rooms.get(playerData.roomId);
      if (room) {
        room.removePlayer(socket.id);
        
        if (room.players.length === 0) {
          // Delete empty room
          rooms.delete(playerData.roomId);
        } else {
          io.to(playerData.roomId).emit('player-left', room.getGameState());
        }
      }
      players.delete(socket.id);
    }
  });
});

// Utility functions
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Start server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`🚀 Multiplayer server running on port ${PORT}`);
  console.log(`🎮 Ready for Arabic Skribble!`);
}); 