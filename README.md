# Average IDE

Average is a privacy-first, offline-capable hybrid IDE platform that integrates Large Language Models (LLMs) directly into your workflow. It consists of a mobile controller (Expo/React Native), a local system node (Python/FastAPI), and a relay server for seamless connectivity.

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18 or higher.
- **Python**: v3.8 or higher.
- **Ollama**: Installed and running (`ollama serve`).
- **Models**: Pull required models:
  ```bash
  ollama pull qwen2.5:0.5b
  ollama pull nomic-embed-text
  ```

### 2. Setup the Relay Server
The relay server facilitates communication between the mobile app and the backend.
```bash
cd relay
npm install
node server.js
```
*The relay runs on port 3000 by default.*

### 3. Setup the Backend (Local Node)
The backend handles AI inference, file management, and tool execution.
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*The backend runs on port 8000 and connects to the relay at ws://localhost:3000.*

### 4. Setup the Mobile App (Web)
The mobile app is your interface to the system. You can run it locally or deploy it to Vercel.

**Local Development:**
```bash
cd app
npm install
npx expo start --tunnel
```

**Deploy to Vercel:**
1. Export the web build:
   ```bash
   cd app
   npx expo export -p web
   ```
2. Deploy the `dist` folder:
   ```bash
   cd dist
   vercel --prod
   ```

## 🌐 Global Distribution
To serve Average IDE to the world:
1. **Landing Page**: Deploy the `/landing-page` folder to Vercel.
2. **Web App**: Deploy the `/app/dist` folder to Vercel.
3. **Relay**: Deploy the `/relay` folder to a provider that supports WebSockets (e.g., Render, Railway, or Fly.io).
4. **Local Node**: Distribute the compiled binary from Step 3 to your users.

## 🛠️ Features
- **Privacy-First**: AI processing happens locally on your machine via Ollama.
- **Multi-Agent Orchestration**: Use multiple local or remote models to solve complex tasks.
- **Codebase Awareness**: Integrated RAG (Retrieval-Augmented Generation) for deep understanding of your local files.
- **Remote Control**: Control your development environment from your phone via the mobile app.
- **Tool Integration**: Access to filesystem, git, and web browsing via MCP (Model Context Protocol).

## 📂 Project Structure
- `/app`: React Native (Expo) mobile application.
- `/backend`: Python FastAPI service for AI and system operations.
- `/relay`: Node.js WebSocket relay for service orchestration.

## 📝 License
This project is licensed under the MIT License - see the `app/LICENSE` file for details.
