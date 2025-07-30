from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv

from database import get_db, engine
from models import Base
from routers import auth, chat, automation, payments, messages
from ai_service import AIService
from websocket_manager import ConnectionManager

load_dotenv()

# Criar tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Automation System",
    description="Sistema de automação com IA para tarefas administrativas",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Manager
manager = ConnectionManager()

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(automation.router, prefix="/api/automation", tags=["automation"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])

@app.get("/")
async def root():
    return {"message": "AI Automation System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Automation API"}

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Processar mensagem com IA
            ai_service = AIService()
            response = await ai_service.process_message(data, client_id)
            await manager.send_personal_message(response, client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )