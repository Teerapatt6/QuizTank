# QuizTank

> A quiz-based learning platform built with a tank battle game concept.
> Designed to make studying interactive, competitive, and fun.

A project for **Software Engineering 1 & 2** — King Mongkut's University 
of Technology Thonburi (KMUTT).

---

## Project Overview

QuizTank is a web-based learning platform that combines 
Battle City-inspired tank game mechanics with a structured 
quiz system. Educators can manage question banks while 
students engage in quiz sessions through an interactive 
game interface.

---

## Features

- Tank-style quiz game interface
- Question bank management for educators
- Room creation and join system
- Score tracking and leaderboard
- User authentication (login / register)
- AI-powered question generation and analysis

---

## Tech Stack

| Layer       | Technology                      |
|-------------|---------------------------------|
| Frontend    | React.js + TypeScript (Vite)    |
| Backend     | Node.js + Express               |
| AI Service  | Python (FastAPI / Flask)        |
| Database    | PostgreSQL                      |
| Container   | Docker + Docker Compose         |
| Version Control | Git + GitHub                |

---

## Folder Structure

QuizTank/
├── Backend/
│   └── QuizTank-feature-backend/  ← Backend root
│       ├── migrations/
│       ├── scripts/
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── middlewares/
│       │   ├── models/
│       │   ├── routes/
│       │   └── services/
│       ├── app.js
│       ├── docker-compose.yml
│       ├── .env.example
│       └── package.json
│
├── Frontend/
│   └── QuizTank-main/             ← Frontend root
│       ├── public/
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── hooks/
│           ├── services/
│           └── types/
│
└── QuizTank-AI/                   ← AI Service
    ├── main.py
    └── requirements.txt

> Note: package.json is inside subdirectories, 
> not at the root level.

---

## Installation

### Prerequisites

- Node.js v18+
- Python 3.10+
- Docker + Docker Desktop
- Git

### Clone the Repository

  git clone https://github.com/your-team/QuizTank.git
  cd QuizTank

---

## How to Run

### Backend + Database (via Docker)

  cd Backend/QuizTank-feature-backend
  cp .env.example .env
  docker compose up -d --build

### Frontend

  cd Frontend/QuizTank-main
  npm install
  npm run dev

### AI Service

  cd QuizTank-AI
  pip install -r requirements.txt
  python main.py

Open: http://localhost:5173

---

## Environment Variables

Create .env inside Backend/QuizTank-feature-backend/:

  DATABASE_URL=postgresql://user:password@db:5432/quiztank
  JWT_SECRET=your_secret_key
  PORT=8000

---

## Test / Demo Information

- Test accounts: admin / student01
- Both frontend and backend must be running simultaneously
- Database is managed via Docker — no manual PostgreSQL 
  installation required

---

## Team Members

| Name              | Role               |
|-------------------|--------------------|
| 66090500434 Tee   | PM - BA            |
| 66090500419 Num   | Dev - UX/UI        |
| 66090500420 Frank | Frontend Developer |
| 66090500439 Euro  | BA - PM            |
| 66090500442 Tar   | Tester - Dev       |

## Course Information

- Course: Software Engineering 1 & 2
- University: KMUTT (King Mongkut's University of Technology Thonburi)
- Academic Year: 2025–2026