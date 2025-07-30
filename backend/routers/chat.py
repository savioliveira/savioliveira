from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models import ChatSession, ChatMessage, User
from routers.auth import get_current_user
from ai_service import AIService

router = APIRouter()

# Schemas
class ChatSessionCreate(BaseModel):
    title: Optional[str] = "Nova Conversa"

class ChatSessionResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: Optional[datetime]

class ChatMessageCreate(BaseModel):
    content: str
    session_id: int

class ChatMessageResponse(BaseModel):
    id: int
    content: str
    role: str
    created_at: datetime
    metadata: dict = {}

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None

class ChatResponse(BaseModel):
    response: str
    session_id: int
    suggestions: List[str] = []

# Endpoints
@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    session: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria uma nova sessão de chat"""
    db_session = ChatSession(
        user_id=current_user.id,
        title=session.title
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista todas as sessões de chat do usuário"""
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.updated_at.desc()).all()
    return sessions

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
async def get_chat_messages(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista todas as mensagens de uma sessão"""
    # Verificar se a sessão pertence ao usuário
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    return messages

@router.post("/chat", response_model=ChatResponse)
async def send_chat_message(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Envia uma mensagem e recebe resposta da IA"""
    
    # Se não foi fornecido session_id, criar uma nova sessão
    if not chat_request.session_id:
        session = ChatSession(
            user_id=current_user.id,
            title=chat_request.message[:50] + "..." if len(chat_request.message) > 50 else chat_request.message
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id
    else:
        # Verificar se a sessão existe e pertence ao usuário
        session = db.query(ChatSession).filter(
            ChatSession.id == chat_request.session_id,
            ChatSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Sessão não encontrada")
        
        session_id = chat_request.session_id
    
    # Salvar mensagem do usuário
    user_message = ChatMessage(
        session_id=session_id,
        content=chat_request.message,
        role="user"
    )
    db.add(user_message)
    
    # Processar com IA
    ai_service = AIService()
    
    # Buscar contexto da conversa (últimas 10 mensagens)
    recent_messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.desc()).limit(10).all()
    
    context = {
        "user_id": current_user.id,
        "username": current_user.username,
        "recent_messages": [
            {"role": msg.role, "content": msg.content}
            for msg in reversed(recent_messages)
        ]
    }
    
    ai_response = await ai_service.process_message(
        chat_request.message,
        str(current_user.id),
        context
    )
    
    # Salvar resposta da IA
    ai_message = ChatMessage(
        session_id=session_id,
        content=ai_response,
        role="assistant"
    )
    db.add(ai_message)
    
    # Atualizar timestamp da sessão
    session.updated_at = datetime.utcnow()
    
    db.commit()
    
    # Gerar sugestões (opcional)
    suggestions = await generate_suggestions(chat_request.message, ai_response)
    
    return ChatResponse(
        response=ai_response,
        session_id=session_id,
        suggestions=suggestions
    )

@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deleta uma sessão de chat"""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    # Deletar mensagens associadas
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    
    # Deletar sessão
    db.delete(session)
    db.commit()
    
    return {"message": "Sessão deletada com sucesso"}

@router.put("/sessions/{session_id}/title")
async def update_session_title(
    session_id: int,
    title: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza o título de uma sessão"""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    session.title = title
    session.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Título atualizado com sucesso"}

async def generate_suggestions(user_message: str, ai_response: str) -> List[str]:
    """Gera sugestões de próximas ações baseadas na conversa"""
    # Implementação simples - pode ser melhorada com IA
    suggestions = []
    
    user_lower = user_message.lower()
    
    if "automação" in user_lower:
        suggestions.extend([
            "Criar nova automação",
            "Ver automações existentes",
            "Configurar triggers"
        ])
    
    if "pagamento" in user_lower:
        suggestions.extend([
            "Configurar gateway de pagamento",
            "Ver histórico de transações",
            "Criar automação de cobrança"
        ])
    
    if "mensagem" in user_lower:
        suggestions.extend([
            "Criar template de mensagem",
            "Configurar envio automático",
            "Ver estatísticas de envio"
        ])
    
    # Sugestões gerais
    if not suggestions:
        suggestions = [
            "Como posso ajudar mais?",
            "Ver relatórios",
            "Configurar nova automação"
        ]
    
    return suggestions[:3]  # Máximo 3 sugestões