from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models import MessageTemplate, User
from routers.auth import get_current_user

router = APIRouter()

# Schemas
class MessageTemplateCreate(BaseModel):
    name: str
    content: str
    type: str  # email, sms, whatsapp, notification
    variables: List[str] = []

class MessageTemplateResponse(BaseModel):
    id: int
    name: str
    content: str
    type: str
    variables: List[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

class MessageTemplateUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    type: Optional[str] = None
    variables: Optional[List[str]] = None
    is_active: Optional[bool] = None

class MessageSendRequest(BaseModel):
    template_id: int
    recipients: List[str]
    variables: Dict[str, str] = {}

class MessageSendResponse(BaseModel):
    message_id: str
    template_id: int
    recipients_count: int
    status: str

# Endpoints
@router.post("/templates", response_model=MessageTemplateResponse)
async def create_message_template(
    template: MessageTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria um novo template de mensagem"""
    db_template = MessageTemplate(
        name=template.name,
        content=template.content,
        type=template.type,
        variables=template.variables
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.get("/templates", response_model=List[MessageTemplateResponse])
async def get_message_templates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    type_filter: Optional[str] = None,
    active_only: bool = False
):
    """Lista todos os templates de mensagem"""
    query = db.query(MessageTemplate)
    
    if type_filter:
        query = query.filter(MessageTemplate.type == type_filter)
    
    if active_only:
        query = query.filter(MessageTemplate.is_active == True)
    
    templates = query.order_by(MessageTemplate.created_at.desc()).all()
    return templates

@router.get("/templates/{template_id}", response_model=MessageTemplateResponse)
async def get_message_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém um template específico"""
    template = db.query(MessageTemplate).filter(
        MessageTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    return template

@router.put("/templates/{template_id}", response_model=MessageTemplateResponse)
async def update_message_template(
    template_id: int,
    template_update: MessageTemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza um template de mensagem"""
    template = db.query(MessageTemplate).filter(
        MessageTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    update_data = template_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    template.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(template)
    return template

@router.delete("/templates/{template_id}")
async def delete_message_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deleta um template de mensagem"""
    template = db.query(MessageTemplate).filter(
        MessageTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    db.delete(template)
    db.commit()
    return {"message": "Template deletado com sucesso"}

@router.post("/send", response_model=MessageSendResponse)
async def send_message(
    message_request: MessageSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Envia mensagem usando um template"""
    template = db.query(MessageTemplate).filter(
        MessageTemplate.id == message_request.template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    if not template.is_active:
        raise HTTPException(status_code=400, detail="Template está inativo")
    
    # Processar variáveis no conteúdo
    content = template.content
    for var, value in message_request.variables.items():
        content = content.replace(f"{{{var}}}", value)
    
    # Simular envio baseado no tipo
    if template.type == "email":
        result = await send_email(content, message_request.recipients)
    elif template.type == "sms":
        result = await send_sms(content, message_request.recipients)
    elif template.type == "whatsapp":
        result = await send_whatsapp(content, message_request.recipients)
    elif template.type == "notification":
        result = await send_notification(content, message_request.recipients)
    else:
        raise HTTPException(status_code=400, detail="Tipo de mensagem não suportado")
    
    return MessageSendResponse(
        message_id=result["message_id"],
        template_id=template.id,
        recipients_count=len(message_request.recipients),
        status=result["status"]
    )

@router.post("/templates/{template_id}/preview")
async def preview_message_template(
    template_id: int,
    variables: Dict[str, str] = {},
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Visualiza como ficará a mensagem com as variáveis aplicadas"""
    template = db.query(MessageTemplate).filter(
        MessageTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    # Aplicar variáveis
    content = template.content
    for var, value in variables.items():
        content = content.replace(f"{{{var}}}", value)
    
    # Identificar variáveis não preenchidas
    import re
    remaining_vars = re.findall(r'\{(\w+)\}', content)
    
    return {
        "preview": content,
        "remaining_variables": remaining_vars,
        "template": {
            "name": template.name,
            "type": template.type,
            "variables": template.variables
        }
    }

@router.get("/types/available")
async def get_available_message_types():
    """Lista tipos de mensagem disponíveis"""
    return {
        "email": {
            "name": "Email",
            "description": "Envio de emails",
            "variables": ["nome", "email", "assunto", "data"],
            "example": "Olá {nome}, bem-vindo ao nosso sistema!"
        },
        "sms": {
            "name": "SMS",
            "description": "Envio de SMS",
            "variables": ["nome", "telefone", "codigo"],
            "example": "Olá {nome}, seu código é: {codigo}"
        },
        "whatsapp": {
            "name": "WhatsApp",
            "description": "Envio via WhatsApp",
            "variables": ["nome", "telefone", "mensagem"],
            "example": "Oi {nome}! {mensagem}"
        },
        "notification": {
            "name": "Notificação",
            "description": "Notificações push",
            "variables": ["titulo", "mensagem", "usuario"],
            "example": "{titulo}: {mensagem}"
        }
    }

@router.get("/stats/summary")
async def get_message_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém estatísticas de mensagens"""
    from sqlalchemy import func
    
    # Total de templates
    total_templates = db.query(func.count(MessageTemplate.id)).scalar()
    
    # Templates por tipo
    templates_by_type = db.query(
        MessageTemplate.type,
        func.count(MessageTemplate.id).label("count")
    ).group_by(MessageTemplate.type).all()
    
    # Templates ativos vs inativos
    active_templates = db.query(func.count(MessageTemplate.id)).filter(
        MessageTemplate.is_active == True
    ).scalar()
    
    inactive_templates = db.query(func.count(MessageTemplate.id)).filter(
        MessageTemplate.is_active == False
    ).scalar()
    
    return {
        "total_templates": total_templates,
        "active_templates": active_templates,
        "inactive_templates": inactive_templates,
        "by_type": {type_name: count for type_name, count in templates_by_type}
    }

# Funções de envio (simuladas)
async def send_email(content: str, recipients: List[str]) -> Dict[str, Any]:
    """Simula envio de email"""
    # Em produção, integraria com serviços como SendGrid, AWS SES, etc.
    return {
        "message_id": f"email_{datetime.utcnow().timestamp()}",
        "status": "sent",
        "provider": "simulated"
    }

async def send_sms(content: str, recipients: List[str]) -> Dict[str, Any]:
    """Simula envio de SMS"""
    # Em produção, integraria com serviços como Twilio, AWS SNS, etc.
    return {
        "message_id": f"sms_{datetime.utcnow().timestamp()}",
        "status": "sent",
        "provider": "simulated"
    }

async def send_whatsapp(content: str, recipients: List[str]) -> Dict[str, Any]:
    """Simula envio via WhatsApp"""
    # Em produção, integraria com WhatsApp Business API
    return {
        "message_id": f"whatsapp_{datetime.utcnow().timestamp()}",
        "status": "sent",
        "provider": "simulated"
    }

async def send_notification(content: str, recipients: List[str]) -> Dict[str, Any]:
    """Simula envio de notificação push"""
    # Em produção, integraria com Firebase Cloud Messaging, OneSignal, etc.
    return {
        "message_id": f"notification_{datetime.utcnow().timestamp()}",
        "status": "sent",
        "provider": "simulated"
    }