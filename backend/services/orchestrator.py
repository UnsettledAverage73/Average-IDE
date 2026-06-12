import asyncio
import os
import json
import httpx
from typing import List, Dict, Any, Optional
from services.llm_service import chat_with_tools, get_ollama_client

class BaseAgent:
    def __init__(self, name: str):
        self.name = name

    async def chat(self, messages: List[Dict[str, str]], tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        raise NotImplementedError

class OllamaAgent(BaseAgent):
    def __init__(self, model_name: str):
        super().__init__(model_name)
        self.model = model_name

    async def chat(self, messages: List[Dict[str, str]], tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        return await chat_with_tools(self.model, messages)

class CodexAgent(BaseAgent):
    """
    Generic Agent for external APIs (Codex/GPT/Claude/Gemini)
    Initial implementation focuses on OpenAI-compatible providers.
    """
    def __init__(self, model_name: str, api_key: str, base_url: str = "https://api.openai.com/v1"):
        super().__init__(model_name)
        self.model = model_name
        self.api_key = api_key
        self.base_url = base_url

    async def chat(self, messages: List[Dict[str, str]], tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": self.model,
                    "messages": messages,
                }
                if tools:
                    payload["tools"] = tools

                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=60.0
                )
                response.raise_for_status()
                data = response.json()
                
                # Adapt OpenAI response to internal format
                choice = data["choices"][0]["message"]
                return {
                    "content": choice.get("content"),
                    "tool_calls": choice.get("tool_calls", []),
                    "messages": messages + [choice],
                    "status": "complete" if not choice.get("tool_calls") else "approval_required"
                }
        except Exception as e:
            return {"error": f"CodexAgent error: {str(e)}"}

class MultiAgentOrchestrator:
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self._load_default_agents()

    def _load_default_agents(self):
        # Load local models from Ollama if possible
        # For now, just hardcode some defaults or empty
        pass

    def register_agent(self, agent: BaseAgent):
        self.agents[agent.name] = agent

    async def orchestrate(self, query: str, agent_names: List[str], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes a multi-agent workflow.
        For now: Sequential execution where each agent sees the previous agent's output.
        """
        if not agent_names:
            return {"error": "No agents selected"}

        messages = context.get("messages", []) if context else []
        messages.append({"role": "user", "content": query})
        
        results = []
        
        for agent_name in agent_names:
            agent = self.agents.get(agent_name)
            if not agent:
                results.append({"agent": agent_name, "error": "Agent not found"})
                continue
            
            response = await agent.chat(messages)
            if "error" in response:
                results.append({"agent": agent_name, "error": response["error"]})
            else:
                results.append({
                    "agent": agent_name,
                    "content": response.get("content"),
                    "tool_calls": response.get("tool_calls")
                })
                # Add to message history for next agent
                messages.append({
                    "role": "assistant",
                    "content": f"[Agent: {agent_name}]\n{response.get('content')}"
                })

        return {
            "query": query,
            "results": results,
            "final_messages": messages
        }

orchestrator = MultiAgentOrchestrator()
