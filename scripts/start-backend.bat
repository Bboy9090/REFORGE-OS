@echo off
REM Bobby's Workshop - Start Backend (Windows)
REM Must run from project root directory

cd /d "%~dp0.."
set PYTHONPATH=%CD%
call backend\venv\Scripts\activate.bat
echo Starting FastAPI backend on http://localhost:8000
echo Working Directory: %CD%
uvicorn backend.main:app --reload --port 8000
pause
