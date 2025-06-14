# سكريبل عربي (Arabic Skribbl.io) 🎨

A modern Arabic-language drawing and guessing game built with Next.js, TypeScript, and Tailwind CSS. Players take turns drawing Arabic words while others try to guess them in real-time.

## ✨ Features

### 🎮 Core Game Features
- **Drawing Canvas**: HTML5 canvas with multiple colors, brush sizes, and eraser tool
- **Arabic Words**: Curated database of Arabic words with different difficulty levels
- **Real-time Chat**: Guess words through live chat system
- **Turn-based Gameplay**: Players take turns drawing while others guess
- **Scoring System**: Points for correct guesses and successful drawings
- **Timer System**: Configurable round timers (30-120 seconds)

### 🌍 Arabic-First Design
- **RTL Support**: Complete right-to-left interface design
- **Arabic Typography**: Native Arabic font rendering and text display
- **Cultural Words**: Culturally appropriate Arabic word selections
- **Localized UI**: All interface elements in Arabic

### 🏠 Room Management
- **Public & Private Rooms**: Create open rooms or private rooms with passwords
- **Customizable Settings**: Configure player limits, round time, and number of rounds
- **Room Browser**: Search and join available game rooms
- **Player Management**: Real-time player list with scores and status

## 🛠 Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling with RTL support
- **Lucide React**: Beautiful icon library
- **HTML5 Canvas**: For drawing functionality

### Planned Backend (Phase 2)
- **Socket.io**: Real-time multiplayer communication
- **Node.js + Express**: Backend server
- **Supabase**: Database and real-time subscriptions
- **Redis**: Session management and caching

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skribble-arabic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 Usage

### Home Page
- View game features and statistics
- Quick access to start playing or join rooms
- Arabic-optimized landing page design

### Rooms Page (`/rooms`)
- Browse available game rooms
- Create new rooms with custom settings
- Search and filter rooms by status
- Join rooms or create private rooms

### Game Page (`/game`)
- Drawing canvas with tools (colors, brush sizes, eraser)
- Real-time chat for guessing
- Player list with scores and current drawer
- Timer and round management
- Word hints for guessers

## 🎨 Game Mechanics

### Drawing Turn
- Select from color palette (12 colors)
- Adjust brush size (1-20px)
- Use eraser tool
- Clear canvas option
- See current word to draw

### Guessing Turn
- Watch other players draw
- Type guesses in chat
- See word length hints
- Earn points for correct guesses

### Scoring
- **Drawer**: Points for successful guesses by others
- **Guesser**: Points for correct and quick guesses
- **Bonus**: Extra points for early correct guesses

## 🏗 Project Structure

```
skribble-arabic/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Home page
│   │   ├── game/
│   │   │   └── page.tsx      # Game interface
│   │   ├── rooms/
│   │   │   └── page.tsx      # Room browser
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   └── components/           # Reusable components (planned)
├── public/                   # Static assets
├── package.json             # Dependencies
└── README.md               # This file
```

## 🔧 Configuration

### Canvas Settings
- **Default Size**: 800x600px
- **Background**: White
- **Brush Types**: Round brush with variable size
- **Colors**: 12 predefined colors

### Game Settings
- **Players**: 2-20 per room
- **Round Time**: 30-120 seconds
- **Total Rounds**: 3-10 rounds
- **Word Categories**: Animals, Objects, Actions, etc.

## 🌐 Arabic Features

### RTL Support
- Complete interface in right-to-left layout
- Proper Arabic text rendering
- RTL-optimized component layouts

### Word Database
Current mock words include:
- قطة (Cat)
- شمس (Sun) 
- بيت (House)
- سيارة (Car)
- شجرة (Tree)
- طائر (Bird)

*Note: Full word database with 1000+ words planned for production*

## 🎯 Development Phases

### ✅ Phase 1: MVP (Current)
- [x] Home page with Arabic design
- [x] Room browser and creation
- [x] Basic drawing canvas
- [x] Game interface with mock data
- [x] Chat system
- [x] Player management UI

### 🔄 Phase 2: Multiplayer (Next)
- [ ] Socket.io integration
- [ ] Real-time drawing synchronization
- [ ] Backend API development
- [ ] Database setup (Supabase)
- [ ] User authentication

### 🎯 Phase 3: Advanced Features
- [ ] Voice chat integration
- [ ] Custom word lists
- [ ] Tournament mode
- [ ] Mobile app (React Native)
- [ ] Advanced scoring algorithms

## 📱 Responsive Design

The game is fully responsive and works on:
- **Desktop**: Full-featured gameplay
- **Tablet**: Touch-optimized drawing
- **Mobile**: Adapted UI for smaller screens

## 🤝 Contributing

We welcome contributions! Areas for contribution:
- Arabic word database expansion
- UI/UX improvements
- Performance optimizations
- Real-time multiplayer features
- Mobile responsiveness

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎮 Live Demo

Visit the live demo: [Coming Soon]

## 📞 Support

For questions or support:
- Create an issue on GitHub
- Join our Discord community [Coming Soon]
- Email: support@skribble-arabic.com [Coming Soon]

---

**Made with ❤️ for the Arabic gaming community**

*Bringing the joy of drawing and guessing games to Arabic speakers worldwide!*
