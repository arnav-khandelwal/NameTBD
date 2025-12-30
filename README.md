# 🎮 BeatFall

A rhythm-based first-person shooter game controlled entirely by hand gestures. Shoot enemies to the beat of the music using computer vision and hand tracking!

## 🌟 Features

### 🎯 Core Gameplay
- **Gesture-Based Controls**: Use hand movements tracked by your webcam to play
- **Beat Detection**: Enemies spawn to the rhythm of your music
- **Multiple Enemy Types**: Face off against Gremlins, Ghosts, Krampus, and powerful Bosses
- **Score System**: Compete for high scores and climb the leaderboard
- **Campaign & Freeplay Modes**: Progress through levels or play freely with any song


## 🎮 How to Play

### Controls

**Camera Movement**
- Move your **open hand left/right** to look around

**Shooting**
- **Pinch your fingers together** (thumb + index finger) to fire

### Enemies

| Enemy | Damage | Shots to Kill | Description |
|-------|--------|---------------|-------------|
| 👺 Gremlin | 10 HP | 1 | Basic enemy, easy to defeat |
| 👻 Ghost | 5 HP | 1 | Fast but weak |
| 😈 Krampus | 20 HP | 3 | Strong enemy, requires multiple hits |
| 👹 BOSS | 50 HP | 5+ | Very dangerous, high health |

### Objective
- 🎯 Shoot enemies to the beat of the music
- ❤️ Survive as long as possible (you have 500 HP)
- ⭐ Get the highest score by defeating enemies
- 🎵 Stronger beats spawn tougher enemies


### 🎨 Visual Features
- **3D Environment**: Immersive world built with React Three Fiber
- **Dynamic Wave Visualization**: Audio-reactive background effects
- **Scope Overlay**: FPS-style targeting system
- **Minimap**: Track enemy positions in real-time
- **Health System**: Survive as long as possible with 500 HP

### 🔐 User Features
- **Firebase Authentication**: Create accounts and track progress
- **Leaderboard**: Global rankings by best score
- **Settings Panel**: Customize audio volumes and haptic feedback
- **Progress Tracking**: Level unlocking system for campaign mode

## 🛠️ Technologies Used

- **Frontend Framework**: React 19.2.0
- **3D Graphics**: React Three Fiber + Drei
- **Hand Tracking**: MediaPipe Tasks Vision
- **Backend**: Firebase (Authentication & Firestore)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Webcam (required for hand gesture controls)
- Modern web browser (Chrome, Edge, or Firefox recommended)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/arnav-khandelwal/BeatFall
   cd BeatFall
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your Firebase config and update `/src/firebase/firebase.js`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Allow webcam access when prompted

## 📝 License
This project is licensed under the MIT License.

## Contributers
[Arnav Khandelwal](https://github.com/arnav-khandelwal) 
[Upanshi Mittal](https://github.com/Upanshi-Mittal)
[Ojasvi Dutt](https://github.com/ojasvidutt)

---

Made with ❤️ for music and gaming enthusiasts

**Happy Gaming! 🎮🎵**
