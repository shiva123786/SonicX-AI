"""
Simple pub/sub service for Event Rescue
"""
from typing import Dict, Any, List, Callable
import asyncio

class Broadcaster:
    def __init__(self):
        self.subscribers: List[Callable] = []
    
    def subscribe(self, callback: Callable):
        """Subscribe to broadcasts."""
        self.subscribers.append(callback)
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast a message to all subscribers."""
        for subscriber in self.subscribers:
            try:
                if asyncio.iscoroutinefunction(subscriber):
                    await subscriber(message)
                else:
                    subscriber(message)
            except Exception as e:
                print(f"Error broadcasting to subscriber: {e}")

# Global broadcaster instance
broadcaster = Broadcaster()
