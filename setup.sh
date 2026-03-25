#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "==========================================="
echo "   QuizTank Local Environment Setup        "
echo "==========================================="

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# 1. Check Docker
if ! command_exists docker; then
  echo "Error: Docker is not installed. Please install Docker and try again."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon is not running. Please start Docker."
  exit 1
fi

echo "✓ Docker is running"

# 2. Check docker-compose (v2 or v1)
if docker-compose --version >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker-compose"
elif docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose"
else
  echo "Error: docker-compose is not installed."
  exit 1
fi

echo "✓ Docker Compose is available"

# 3. Start Database
echo "Starting PostgreSQL Database..."
$DOCKER_COMPOSE up -d db

# Wait for DB to be ready
echo "Waiting for Database to be ready..."
RETRIES=15
until docker exec quiztank_db pg_isready -U postgres > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "Waiting for database connection... ($RETRIES retries left)"
  sleep 2
  RETRIES=$((RETRIES-1))
done

if [ $RETRIES -eq 0 ]; then
  echo "Error: Timed out waiting for database."
  exit 1
fi

echo "✓ Database is up and running"

# 4. Install backend dependencies (if not existing)
echo "Installing Backend dependencies..."
cd QuizTank-Backend
npm install
echo "✓ Backend dependencies installed"

# 5. Create Admin User
echo "Creating Admin User..."
node scripts/create_admin.js

# 6. Install frontend dependencies
echo "Installing Frontend dependencies..."
cd ../QuizTank-Frontend
npm install
echo "✓ Frontend dependencies installed"

# 7. Install AI dependencies
echo "Setting up AI Environment..."
cd ../QuizTank-AI
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo "✓ AI dependencies installed"

echo "==========================================="
echo "Setup Complete!"
echo "To run locally, open three terminals:"
echo "Terminal 1 (Backend): cd QuizTank-Backend && npm run dev"
echo "Terminal 2 (Frontend): cd QuizTank-Frontend && npm run dev"
echo "Terminal 3 (AI): cd QuizTank-AI && source venv/bin/activate && uvicorn main:app --reload"
echo ""
echo "pgAdmin URL: http://localhost:5050"
echo "pgAdmin Login: admin@quiztank.com / admin"
echo "pgAdmin DB Auth: Host: db | Port: 5432 | User: postgres | Pass: change_me"
echo ""
echo "Web Admin Login: admin / password123"
echo "==========================================="
