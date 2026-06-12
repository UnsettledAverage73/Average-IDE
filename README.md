# Average IDE

Average is a privacy-first, offline-capable hybrid IDE platform that integrates Large Language Models (LLMs) directly into your workflow. It consists of a mobile controller (Expo/React Native), a local system node (Python/FastAPI), and a relay server for seamless connectivity.

## 🚀 Quick Start (Automated)

Run one command to start everything:
- **Linux/macOS**: `./launch.sh`
- **Windows**: `launch.bat`

---

## 📱 Mobile Applications (Android & iOS)

While you can use the [Web App](https://dist-beige-omega-65.vercel.app), you can also build native binaries for the best experience.

### Build with EAS (Expo Application Services)
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `cd app && eas build:configure`
4. Build:
   - **Android**: `eas build --platform android --profile preview`
   - **iOS**: `eas build --platform ios --profile preview`

---

## 🌐 Global Links
- **Official Website**: [https://average-ide-landing.vercel.app](https://average-ide-landing.vercel.app)
- **Web App**: [https://dist-beige-omega-65.vercel.app](https://dist-beige-omega-65.vercel.app)

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
