from fastapi import WebSocket
from typing import Dict, List
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, List[str]] = {}  # user_id -> [client_ids]
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"Cliente {client_id} conectado")
    
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            print(f"Cliente {client_id} desconectado")
    
    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(message)
            except Exception as e:
                print(f"Erro ao enviar mensagem para {client_id}: {e}")
                self.disconnect(client_id)
    
    async def send_json_message(self, data: dict, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(json.dumps(data, ensure_ascii=False))
            except Exception as e:
                print(f"Erro ao enviar JSON para {client_id}: {e}")
                self.disconnect(client_id)
    
    async def broadcast(self, message: str):
        """Envia mensagem para todos os clientes conectados"""
        disconnected = []
        for client_id, connection in self.active_connections.items():
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Erro ao enviar broadcast para {client_id}: {e}")
                disconnected.append(client_id)
        
        # Remove conexões que falharam
        for client_id in disconnected:
            self.disconnect(client_id)
    
    async def broadcast_to_user(self, message: str, user_id: str):
        """Envia mensagem para todas as sessões de um usuário específico"""
        if user_id in self.user_sessions:
            for client_id in self.user_sessions[user_id]:
                await self.send_personal_message(message, client_id)
    
    def associate_user(self, client_id: str, user_id: str):
        """Associa um client_id a um user_id"""
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = []
        
        if client_id not in self.user_sessions[user_id]:
            self.user_sessions[user_id].append(client_id)
    
    def get_connected_count(self) -> int:
        """Retorna o número de conexões ativas"""
        return len(self.active_connections)
    
    def get_user_connections(self, user_id: str) -> List[str]:
        """Retorna todas as conexões de um usuário"""
        return self.user_sessions.get(user_id, [])