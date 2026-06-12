import asyncio
import json
import websockets
import os
import logging
import psutil
import subprocess
from typing import Dict, Any
from services.orchestrator import orchestrator, OllamaAgent, CodexAgent
from services.ChatHistoryService import history_service
from mcp_server.search import search_filenames, search_text
from mcp_server.git import git_status, git_diff, git_log
from services.OllamaService import OllamaService
from routers.cloud import get_local_ip_range, check_ollama

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("relay_client")

class RelayClient:
    def __init__(self, relay_url: str = "ws://localhost:3000", node_id: str = "default-node"):
        self.relay_url = relay_url
        self.node_id = node_id
        self.ws = None
        self.running = False
        self._setup_agents()
        self.ollama_service = OllamaService()

    def _setup_agents(self):
        # Register a default local agent if possible
        orchestrator.register_agent(OllamaAgent("qwen2.5:0.5b"))
        
        # Check for Codex/OpenAI key
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            orchestrator.register_agent(CodexAgent("gpt-3.5-turbo-instruct", openai_key))
            logger.info("Codex agent registered.")

    async def connect(self):
        while True:
            try:
                logger.info(f"Connecting to relay at {self.relay_url}...")
                async with websockets.connect(self.relay_url) as ws:
                    self.ws = ws
                    # Register this node
                    await ws.send(json.dumps({
                        "type": "register_node",
                        "payload": {"nodeId": self.node_id}
                    }))
                    
                    logger.info(f"Node registered as: {self.node_id}")
                    
                    async for message in ws:
                        await self.handle_message(message)
            except Exception as e:
                logger.error(f"Relay connection error: {e}. Retrying in 5s...")
                await asyncio.sleep(5)

    async def handle_message(self, message_raw: str):
        try:
            message = json.loads(message_raw)
            msg_type = message.get("type")
            payload = message.get("payload", {})
            app_id = payload.get("appId")

            if msg_type == "command":
                command = payload.get("command")
                args = payload.get("args", {})
                logger.info(f"Received command: {command} from app: {app_id}")
                
                result = await self.execute_command(command, args)
                
                # Send result back
                await self.ws.send(json.dumps({
                    "type": "result",
                    "payload": {
                        "appId": app_id,
                        "command": command,
                        "result": result
                    }
                }))
            elif msg_type == "registered":
                self.node_id = payload.get("nodeId")
                logger.info(f"Confirmed registration with ID: {self.node_id}")
            elif msg_type == "app_connected":
                logger.info(f"App connected: {payload.get('appId')}")

        except Exception as e:
            logger.error(f"Error handling message: {e}")

    async def execute_command(self, command: str, args: Dict[str, Any]) -> Any:
        try:
            # --- FILES & NAVIGATION ---
            if command == "list_files":
                root_path = args.get("path", os.getcwd())
                return self.get_file_tree(root_path)
            elif command == "read_file":
                file_path = args.get("path")
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        return f.read()
                return {"error": "File not found"}
            elif command == "get_active_ports":
                return self.get_listening_ports()
            
            # --- SEARCH ---
            elif command == "search_files":
                query = args.get("query", "")
                path = args.get("path", ".")
                return search_filenames(query, path)
            elif command == "search_text":
                query = args.get("query", "")
                path = args.get("path", ".")
                return search_text(query, path)
            
            # --- GIT & GITHUB ---
            elif command == "git_status":
                return git_status()
            elif command == "git_diff":
                return git_diff()
            elif command == "git_log":
                return git_log()
            elif command == "git_commit":
                msg = args.get("message", "Auto-commit from Average")
                try:
                    subprocess.run("git add .", shell=True, cwd=os.getcwd())
                    res = subprocess.run(f'git commit -m "{msg}"', shell=True, cwd=os.getcwd(), capture_output=True, text=True)
                    return res.stdout or res.stderr
                except Exception as e:
                    return str(e)
            elif command == "git_push":
                try:
                    res = subprocess.run("git push", shell=True, cwd=os.getcwd(), capture_output=True, text=True)
                    return res.stdout or res.stderr
                except Exception as e:
                    return str(e)

            # --- SESSIONS ---
            elif command == "list_sessions":
                return history_service.list_sessions()
            elif command == "create_session":
                return {"session_id": history_service.create_session()}
            elif command == "get_session":
                session_id = args.get("session_id")
                return history_service.get_session(session_id)
            elif command == "delete_session":
                session_id = args.get("session_id")
                history_service.delete_session(session_id)
                return {"status": "success"}

            # --- MODEL MANAGEMENT ---
            elif command == "check_models":
                models = await self.ollama_service.list_models()
                return {"models": [m.get("name") for m in models] if isinstance(models, list) else []}
            elif command == "pull_model":
                model_name = args.get("model_name")
                await self.ollama_service.pull_model(model_name)
                return {"status": "started", "model": model_name}

            # --- CLOUD / DISCOVERY ---
            elif command == "discover_nodes":
                ips = get_local_ip_range()
                tasks = [check_ollama(ip, 11434) for ip in ips]
                results = await asyncio.gather(*tasks)
                return {"results": [r for r in results if r is not None]}

            # --- ORCHESTRATION ---
            elif command == "orchestrate":
                query = args.get("query")
                agents = args.get("agents", ["qwen2.5:0.5b"])
                context = args.get("context", {})
                return await orchestrator.orchestrate(query, agents, context)
            
            elif command == "ping":
                return "pong"
            else:
                return {"error": f"Unknown command: {command}"}
        except Exception as e:
            logger.error(f"Command execution error: {e}")
            return {"error": str(e)}

    def get_listening_ports(self):
        """Detects active development servers."""
        ports = []
        try:
            for conn in psutil.net_connections(kind='inet'):
                if conn.status == 'LISTEN' and conn.laddr.port not in [22, 30, 3000, 8000, 11434]:
                    name = "Dev Server"
                    if conn.laddr.port == 5173: name = "Vite"
                    elif conn.laddr.port == 3000: name = "React/Next"
                    elif conn.laddr.port == 8080: name = "Vue/Webpack"
                    
                    ports.append({
                        "port": conn.laddr.port,
                        "name": name,
                        "url": f"http://localhost:{conn.laddr.port}"
                    })
        except Exception as e:
            logger.error(f"Error scanning ports: {e}")
        return sorted(ports, key=lambda x: x['port'])

    def get_file_tree(self, root_path: str, max_depth: int = 2):
        if not os.path.exists(root_path):
            return {"error": "Directory not found"}

        def scan(dir_path, current_depth):
            if current_depth > max_depth:
                return None
            tree = []
            try:
                entries = sorted(list(os.scandir(dir_path)), key=lambda e: (not e.is_dir(), e.name.lower()))
                for entry in entries:
                    if entry.name.startswith('.') or entry.name in ['node_modules', '__pycache__', 'venv', '.git']:
                        continue
                    node = {
                        "name": entry.name,
                        "path": entry.path,
                        "isDirectory": entry.is_dir()
                    }
                    if entry.is_dir():
                        children = scan(entry.path, current_depth + 1)
                        if children is not None:
                            node["children"] = children
                    tree.append(node)
            except PermissionError:
                pass
            return tree
        return scan(root_path, 0)

async def start_relay_client(relay_url: str = "ws://localhost:3000", node_id: str = "default-node"):
    client = RelayClient(relay_url, node_id)
    await client.connect()

if __name__ == "__main__":
    asyncio.run(start_relay_client())
