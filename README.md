# QuizTank - Gamified Quiz Learning Platform

QuizTank is a web-based learning platform that combines tank-style gameplay with interactive quizzes. Learners can play and compete, while creators can build game rooms and use AI-assisted question generation.

Developed for Software Engineering 1 and 2 at King Mongkut's University of Technology Thonburi (KMUTT), academic year 2025–2026.

## Project Overview

- Turns quiz practice into an interactive tank-game experience.
- Supports game room creation, discovery, sharing, reviews, favourites, and leaderboards.
- Provides AI-assisted quiz generation and editing from a topic prompt.
- Includes challenge and administration workflows for learning activities and content management.

## Implemented Features

1. **Learner and Creator Features**

    - Browse, search, create, edit, share, and play quiz game rooms.
    - Join rooms by game code with visibility and optional password controls.
    - Play tank-based quiz sessions with scoring, statistics, and leaderboards.
    - Save favourite games, submit reviews, and participate in challenges.
    - Generate and refine quiz rooms through an AI service.

2. **Authentication and Security**

    - Registration, login, and OTP verification.
    - JWT-based protected routes.
    - Optional two-factor authentication with QR-code setup.
    - Profile, avatar, password, and security-setting management.

3. **Administration**

    - Manage users, games, reports, challenges, maps, and game-play records.
    - Seed local administrator and development data through backend scripts.

## Application Architecture

QuizTank consists of four local services: a React frontend, an Express REST API, a FastAPI AI service, and a PostgreSQL database. Docker Compose starts PostgreSQL for local development, while the frontend, backend, and AI service are run separately to support development and testing.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router DOM, Tailwind CSS |
| Backend API | Node.js, Express, PostgreSQL, JWT |
| AI Service | Python, FastAPI, Groq API |
| Development Tools | Docker Compose, pgAdmin, Git, GitHub |

## Repository Structure

```text
QuizTank/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                         # GitHub Actions workflow
├── QuizTank-AI/
│   ├── main.py                               # FastAPI quiz-generation service and Groq integration
│   ├── requirements.txt                      # Python dependencies
│   └── result/                               # Saved generated JSON outputs for debugging
├── QuizTank-Backend/
│   ├── db/
│   │   └── init.sql                          # PostgreSQL initialization schema
│   ├── scripts/
│   │   ├── create_admin.js                   # Creates a local administrator account
│   │   └── mock_data.js                      # Inserts local options and map seed data
│   ├── src/
│   │   ├── app.js                            # Express application entry point and API mounting
│   │   ├── config/
│   │   │   ├── cloudinary.js                 # Media storage configuration
│   │   │   └── db.js                         # PostgreSQL connection configuration
│   │   ├── controllers/                      # Auth, admin, game, room, gameplay, map, review, user logic
│   │   ├── middlewares/                      # JWT authorization and multipart upload handling
│   │   ├── models/                           # Database access modules by feature area
│   │   ├── routes/                           # REST API routes mounted under /api
│   │   └── services/
│   │       └── emailService.js               # Development-mode OTP/contact mail service
│   ├── package.json
│   └── package-lock.json
├── QuizTank-Frontend/
│   ├── public/
│   │   └── sounds/                           # Tank game audio effects
│   ├── src/
│   │   ├── assets/                           # Application images
│   │   ├── components/
│   │   │   ├── game/                         # Tank game component and stylesheet
│   │   │   ├── games/                        # Game form, tabs, and media upload components
│   │   │   ├── layout/                       # Authentication and page layouts
│   │   │   ├── skeletons/                    # Loading states
│   │   │   └── ui/                           # Reusable shadcn/Radix UI components
│   │   ├── constants/                        # Shared route constants
│   │   ├── contexts/                         # Authentication state provider
│   │   ├── data/                             # Frontend development/mock datasets
│   │   ├── hooks/                            # Form and UI hooks
│   │   ├── lib/                              # Shared utilities
│   │   ├── pages/
│   │   │   ├── admin/                        # Admin management pages
│   │   │   └── *.tsx                         # Public, authentication, gameplay and profile pages
│   │   ├── services/                         # Axios API modules and EmailJS client integration
│   │   ├── types/                            # TypeScript domain models
│   │   ├── utils/                            # Level and difficulty utilities
│   │   ├── App.tsx                           # Client-side routing and providers
│   │   └── main.tsx                          # React entry point
│   ├── package.json
│   ├── tailwind.config.ts
│   └── vite.config.ts                        # Development server configured on port 8080
├── docker-compose.yml                        # PostgreSQL and pgAdmin services only
├── setup.sh                                  # Unix-oriented local setup helper
└── README.md
```

## Installation and Setup on Windows

### Prerequisites

Install Docker Desktop, Node.js LTS, Python 3.10 or later, Git or GitHub Desktop, and Visual Studio Code. After installation, open a new terminal and verify the tools:

```bash
node --version
npm --version
python --version
docker --version
docker compose version
```

### 1. Clone the Repository

```bash
git clone https://github.com/Teerapatt6/QuizTank.git
cd QuizTank
```

### 2. Configure the Database

Create `.env` in the project root beside `docker-compose.yml`:

```env
DB_USER=postgres
DB_PASSWORD=replace_with_your_local_password
DB_NAME=quiztankdb
```

Use the same database values in the backend configuration.

### 3. Start PostgreSQL with Docker

```bash
docker compose up -d db
docker compose ps
```

PostgreSQL is exposed locally at `localhost:5434`.

### 4. Run the Backend API

Open a new terminal:

```bash
cd QuizTank-Backend
npm install
```

Create `QuizTank-Backend/.env`:

```env
PORT=3000
FRONTEND_URL=http://localhost:8080
DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=replace_with_your_local_password
DB_NAME=quiztankdb
JWT_SECRET=replace_with_a_long_random_local_secret
AIGEN_URL=http://127.0.0.1:8000
NODE_ENV=development
```

Optionally seed local development data after the database starts:

```bash
node scripts/create_admin.js
node scripts/mock_data.js
```

Start the backend:

```bash
npm run dev
```

Verify it at `http://localhost:3000/`.

### 5. Run the Frontend

Open another terminal:

```bash
cd QuizTank-Frontend
npm install
```

Create `QuizTank-Frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_FRONTEND_URL=http://localhost:8080
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:8080/`.

### 6. Run the AI Service

Open another terminal. In Git Bash on Windows:

```bash
cd QuizTank-AI
python -m venv venv
source venv/Scripts/activate
python -m pip install -r requirements.txt
```

Create `QuizTank-AI/.env`:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
SAVE_RESULT_TO_FILE=true
```

Start the AI service:

```bash
python -m uvicorn main:app --reload --port 8000
```

Open `http://127.0.0.1:8000/docs` to view the API documentation. AI-assisted generation requires a valid Groq API key.

## Daily Development Workflow

After completing the initial setup, run these services in separate terminals:

```bash
# Terminal 1: Database
docker compose up -d db

# Terminal 2: Backend
cd QuizTank-Backend
npm run dev

# Terminal 3: Frontend
cd QuizTank-Frontend
npm run dev

# Terminal 4: AI Service
cd QuizTank-AI
source venv/Scripts/activate
python -m uvicorn main:app --reload --port 8000
```

To stop the database container:

```bash
docker compose down
```

## Local Verification

| Component | Address or Command | Expected Result |
| --- | --- | --- |
| Database | `docker compose ps` | Database container is running |
| Backend API | `http://localhost:3000/` | Backend response is displayed |
| Frontend | `http://localhost:8080/` | QuizTank interface loads |
| AI Service | `http://127.0.0.1:8000/docs` | FastAPI documentation loads |

## Optional Database Inspection

pgAdmin is intended only for local development and is not required to run or test the application. When using it locally, start the service with `docker compose up -d pgadmin` and connect using values defined in your local environment configuration. Any credentials or default accounts currently checked into this repository are development-only bootstrap values for local use; they must be overridden, changed, or removed for any shared, staging, production, or other non-local environment. Do not commit real passwords, API keys, administrator credentials, or populated `.env` files to the public repository.

## Future Enhancements

- Personalized learning recommendations based on learner progress.
- Deeper analytics for question and game performance.
- Improved challenge and content-discovery features.
- Optional premium learning content or subscription support.

## Team Members

| Name | Responsibility |
| --- | --- |
| 66090500434 Tee | Project Manager and Business Analysis |
| 66090500419 Num | Developer and UX/UI |
| 66090500420 Frank | Frontend Developer and Tester |
| 66090500439 Euro | Business Analysis and Project Manager |
| 66090500442 Tar | Tester and Developer |

## Course Information

QuizTank was developed for Software Engineering 1 and 2 at King Mongkut's University of Technology Thonburi (KMUTT), academic year 2025–2026.
