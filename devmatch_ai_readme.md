# DevMatch AI — Intelligent Hackathon Teammate Finder 🚀

DevMatch AI is an AI-powered developer matchmaking platform designed to help students and developers quickly find highly compatible teammates for hackathons, ensuring a balanced skill distribution and maximizing the probability of project success.

This project is built using **Antigravity AI-assisted development**, where the entire codebase (frontend, backend, algorithms, and styling) was generated and expanded through prompt-driven development inside VS Code.

The platform analyzes developer profiles — including **skills, experience levels, interests, and campus information** — to automatically recommend compatible teammates using a custom **Cosine Vector Similarity engine**.

---

## 🌟 Core Features

### 🧠 AI Developer Matching (Cosine Similarity)
DevMatch converts developer profiles into weighted **skill vectors**, calculating compatibility scores from 0-100%.
- Factors in subjective experience levels (Beginner, Intermediate, Advanced, Expert)
- Recognizes overlapping toolsets
- Implements mathematical normalization for consistent scoring across different skill volumes.

### 🎭 3D-Stacked Swipe Discovery
The frontend employs a high-fidelity, 3D-stacked card interface powered by **Framer Motion**.
- **Physical Deck Logic:** Render up to 3 upcoming profiles in a stacked deck with depth-scaling.
- **Swipe Right (Like)** to connect with a developer.
- **Swipe Left (Pass)** to skip.
- Cards display vital stats instantly: Profile picture, Campus details, Skill tags, and the AI Match Percentage.

### 🏎️ Local Hackathon Mode & Control Center
A specialized high-speed environment for physical events and live demonstrations.
- **Rapid Registration:** Session-less, one-click entry into a local event pool.
- **Live Compatibility Leaderboard:** An exhaustive matrix displaying the highest potential pair-wise synergies in the room.
- **AI Suggested Teams (Greedy Clustering):** Automatically groups the entire participant pool into optimized 3-4 person squads based on mutual cosine similarity maximization.

### 🏆 Team Formation System
Create specific hackathon squads outside of local mode.
- Define explicit requirements: e.g., "Web3 Track", Max Size: 4, "Intermediate+" minimum experience.
- Send and manage join requests seamlessly.

### 💬 Real-Time Team Collaboration
Internal communication system using **Socket.io**.
- Instant bi-directional messaging within your team room.
- Live typing indicators ("Someone is typing...").

### ✨ Live AI Engine Presentation Demo
A specialized presentation feature built to showcase the math to live audiences.
- Presenters manually select Participant A and Participant B from the live pool.
- Instantly visualizes the generated mathematical vectors alongside the resulting Cosine Similarity percentage.

---

## 🏗️ Tech Stack & Architecture

**Frontend**
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4 + Custom CSS Variables
- **Aesthetic:** Light Elegant Beauty Theme (Off-White/Cream, Soft Corals, Serif Typography)
- **Typography:** Playfair Display (Headings), Inter/Poppins (UI)
- **Animation:** Framer Motion (3D Stacks, Transitions)

**Backend**
- **Runtime:** Node.js
- **Server:** Express.js
- **Database:** MongoDB / Mongoose
- **Real-Time:** Socket.io
- **Auth:** JWT (JSON Web Tokens) & bcryptjs 

---

## 📦 Installation & Setup

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/devmatch-ai.git
cd devmatch-ai
```

2. **Backend Setup:**
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/devmatch
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:3000
```
Start the backend server:
```bash
npm start
```
*Seed database with 12+ robust sample profiles:*
```bash
node seed.js
```
*(Optional) Inject users into the Hackathon Mode pool:*
```bash
node make_hackathon_seed.js
```

3. **Frontend Setup:**
Open a new terminal.
```bash
cd frontend
npm install
npm run dev
```

The application will be running at [http://localhost:3000](http://localhost:3000).

---

## 📡 API Overview

**Auth & Users**
- `POST /api/auth/register` — Create a new account
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Get current profile

**Hackathon Mode (New)**
- `POST /api/hackathon/join` — Rapid attendee registration
- `GET /api/hackathon/:id/matches` — Full compatibility matrix for event
- `GET /api/hackathon/:id/teams` — AI-generated greedy clustering squads

**AI Matching Engine**
- `GET /api/matches` — Get mathematically ranked priority list of developers
- `POST /api/matches/swipe` — Record a left/right swipe
- `POST /api/matches/demo-compare` — (Live Demo) Compare two arbitrary skill payloads instantly 

---

## 🔮 Future Improvements
- **GitHub Integration:** Automatic code repository scraping to verify skill tags objectively.
- **Certificate Uploads:** Integration allowing physical proof of online certifications.

---

> Built at the speed of thought. 
> *Powered by Antigravity.*
