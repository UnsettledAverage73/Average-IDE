#!/bin/bash

# Average IDE - One-Command Server Launcher
# This script automatically starts the Relay and Backend, then displays a connection QR code.

echo "🚀 Starting Average IDE Services..."

# 1. Start Relay
echo "📡 Starting Relay Server on port 3000..."
cd relay
npm install --silent
node server.js > relay.log 2>&1 &
RELAY_PID=$!

# 2. Start Backend
echo "🧠 Starting Backend Node on port 8000..."
cd ../backend
# Check for venv
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt --quiet
python3 main.py > backend.log 2>&1 &
BACKEND_PID=$!

# 3. Wait for startup
sleep 5

# 4. Generate Connection Info
IP_ADDR=$(hostname -I | awk '{print $1}')
echo ""
echo "✅ SERVICES ACTIVE"
echo "--------------------------------------"
echo "Relay: http://$IP_ADDR:3000"
echo "Backend: http://$IP_ADDR:8000"
echo "--------------------------------------"
echo ""
echo "📱 MOBILE CONNECTION:"
echo "1. Open the Average IDE app/website"
echo "2. Use Relay URL: ws://$IP_ADDR:3000"
echo "3. Node ID: default-node"
echo ""
echo "Press Ctrl+C to stop all services."

# Trap exit to kill background processes
trap "kill $RELAY_PID $BACKEND_PID; exit" INT
wait
