#!/bin/bash

# Function to kill processes on exit
cleanup() {
    echo "Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "Starting Eudaimonai..."

# Start Backend
echo "Setting up Backend..."
cd app/backend

# Use uv for dependency management
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment with uv..."
    uv venv
fi

echo "Installing dependencies with uv..."
uv pip install -r requirements.txt

echo "Starting Backend on port 8000..."
# Use uv run to execute uvicorn in the virtual environment
uv run uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend..."
cd ../frontend
echo "Starting Frontend on port 5173..."
npm run dev -- --host &
FRONTEND_PID=$!

echo "Eudaimonai is running!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000/docs"

wait
