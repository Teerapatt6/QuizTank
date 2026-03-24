# QuizTank

> A Battle City-inspired multiplayer quiz learning platform.  
> Compete, learn, and tank your way through knowledge.

---

## Project Overview

QuizTank is a web-based learning platform that combines classic Battle City tank game mechanics with an interactive quiz system. Players compete in real-time quiz battles inside a tank-style arena, making learning engaging and competitive.

Built as a university Software Enginerring 1&2 Project (KMUTT).

---

## Features

- Real-time multiplayer quiz battles (tank arena style)
- Question bank management for educators
- Room creation and join system
- Score tracking and leaderboard
- User authentication (login / register)
- Responsive UI for desktop

---

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | React.js + TypeScript (Vite)      |
| Backend        | Node.js + Express                 |
| Database       | PostgreSQL                        |
| Containerize   | Docker (docker-compose.yml)       |
| Version Control| Git + GitHub                      |

---

## Folder Structure

```
QuizTank/
├── Backend/
│   └── QuizTank-feature-backend/   ← Backend root (has package.json)
│       ├── migrations/             # DB migration scripts
│       ├── scripts/
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── middlewares/
│       │   ├── models/
│       │   ├── routes/
│       │   └── services/
│       ├── app.js
│       ├── init.sql
│       ├── docker-compose.yml
│       ├── .env.example
│       └── package.json
│
└── Frontend/
    └── QuizTank-main/              ← Frontend root (has package.json)
        ├── public/
        ├── src/
        │   ├── assets/
        │   ├── components/
        │   ├── constants/
        │   ├── contexts/
        │   ├── data/
        │   ├── hooks/
        │   ├── lib/
        │   ├── pages/
        │   ├── services/
        │   ├── types/
        │   └── utils/
        ├── App.tsx
        ├── main.tsx
        ├── index.css
        ├── vite-env.d.ts
        └── package.json
```

> **Important:** `package.json` is inside the subdirectories, not at the root `Frontend/` or `Backend/` level.

---

## Installation

### Prerequisites

- Node.js v18+
- PostgreSQL running locally (or via Docker)
- Git

### Clone the Repository

```bash
git clone https://github.com/your-team/QuizTank.git
cd QuizTank
```

### Install Backend Dependencies

```bash
cd Backend/QuizTank-feature-backend
npm install
```

### Install Frontend Dependencies

```bash
cd Frontend/QuizTank-main
npm install
```

---

## Environment Setup

Copy the example env file and fill in your local database credentials:

```bash
cd Backend/QuizTank-feature-backend
cp .env.example .env
```

Edit `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=quiztank
DB_USER=root
DB_PASS=yourpassword
JWT_SECRET=your_secret_key
```

---

## How to Run

### Option A — Run Manually

Open **two separate terminals**:

**Terminal 1 — Backend:**
```bash
cd Backend/QuizTank-feature-backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd Frontend/QuizTank-main
npm run dev
```

Then open: [http://localhost:5173](http://localhost:5173) (Vite default port)

### Option B — Run with Docker

```bash
cd Backend/QuizTank-feature-backend
docker-compose up
```

---

## Database Setup

```bash
cd Backend/QuizTank-feature-backend
PostgreSQL -u root -p quiztank < init.sql
```

Or run migration scripts located in `/migrations`.

---

## Test / Demo Information

- Test accounts: `admin` / `student01` (see seed data)
- Test cases: see `/docs/test-cases.md` (if available)
- To run locally: follow the steps above, both frontend and backend must be running simultaneously

---

## Common Issues

| Problem | Cause | Fix |
|---|---|---|
| `npm error ENOENT: no such file or directory, package.json` | Running npm from wrong directory | `cd` into `Frontend/QuizTank-main` or `Backend/QuizTank-feature-backend` first |
| Cannot connect to DB | `.env` not configured | Copy `.env.example` → `.env` and fill in DB credentials |
| Port already in use | Another process using port | Change port in `.env` or kill the process |

---

## Team Members

| Name | Role |
|---|---|
| 66090500434 Tee | PM - BA |
| 66090500419 Num | Dev - UX/UI |
| 66090500420 Frank | Frontend Developer |
| 66090500439 Euro | BA - PM |
| 66090500442 Tar | Tester - Dev |

---

## Future Improvements

- Mobile responsive layout
- Sound effects and animation polish
- AI-generated quiz questions
- Online deployment (Vercel + Railway)
- Teacher analytics dashboard

---

## License

This project is for educational purposes (KMUTT Software Enginerring 1&2 Project).
