import httpx
import logging
from typing import Dict, Any, Optional, AsyncGenerator
from config import settings

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self):
        self.base_url = settings.OLLAMA_HOST.rstrip('/')

    async def generate(self, model: str, prompt: str, system: Optional[str] = None, format_json: bool = False, timeout: float = 60.0) -> Dict[str, Any]:
        """Executes non-streaming generation on the Ollama cluster."""
        payload: Dict[str, Any] = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.4,
                "top_p": 0.9,
            }
        }
        if system:
            payload["system"] = system
        if format_json:
            payload["format"] = "json"

        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                resp = await client.post(f"{self.base_url}/api/generate", json=payload)
                resp.raise_for_status()
                return resp.json()
            except Exception as e:
                logger.error(f"Ollama generation failed ({model}): {e}")
                raise

    async def chat(self, model: str, messages: list, timeout: float = 45.0) -> Dict[str, Any]:
        """Executes multi-turn chat completion."""
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.6,
            }
        }
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                resp = await client.post(f"{self.base_url}/api/chat", json=payload)
                resp.raise_for_status()
                return resp.json()
            except Exception as e:
                logger.error(f"Ollama chat failed ({model}): {e}")
                raise

    async def chat_stream(self, model: str, messages: list, timeout: float = 60.0) -> AsyncGenerator[str, None]:
        """Streams chat tokens using Server-Sent Events (SSE)."""
        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": 0.6,
            }
        }
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
                response.raise_for_status()
                async for chunk in response.aiter_lines():
                    if chunk:
                        yield chunk

ollama_client = OllamaClient()
