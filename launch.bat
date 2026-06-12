@echo off
echo 🚀 Starting Average IDE Services...

echo 📡 Starting Relay Server...
start /b cmd /c "cd relay && npm install --silent && node server.js > relay.log 2>&1"

echo 🧠 Starting Backend Node...
start /b cmd /c "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt --quiet && python main.py > backend.log 2>&1"

echo ✅ SERVICES ACTIVE
echo --------------------------------------
echo Open the app and connect to this PC's IP on port 3000.
echo --------------------------------------
pause
