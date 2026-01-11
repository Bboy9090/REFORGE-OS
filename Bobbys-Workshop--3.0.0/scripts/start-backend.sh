#!/bin/bash
# Bobby's Workshop - Start Backend (Mac/Linux)
# Must run from project root directory

cd "$(dirname "$0")/.."
export PYTHONPATH="$PWD"
source backend/venv/bin/activate
echo "Starting FastAPI backend on http://localhost:8000"
echo "Working Directory: $PWD"
uvicorn backend.main:app --reload --port 8000
