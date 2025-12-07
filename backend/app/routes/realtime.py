from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.pubsub_service import broadcaster
import asyncio

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    async def send_callable(message):
        try:
            await websocket.send_json(message)
        except Exception:
            raise

    # register websocket sender
    broadcaster.register_ws_client(send_callable)

    try:
        while True:
            # Keep the connection alive; react to incoming pings if needed
            data = await websocket.receive_text()
            # For now, we ignore incoming messages; client may send 'ping'
            if data == 'ping':
                await websocket.send_text('pong')
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        broadcaster.unregister_ws_client(send_callable)
