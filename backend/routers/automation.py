from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import json

from database import get_db
from models import Automation, AutomationExecution, User
from routers.auth import get_current_user
from ai_service import AIService

router = APIRouter()

# Schemas
class AutomationCreate(BaseModel):
    name: str
    description: str
    type: str  # message, payment, deposit, email, etc.
    config: Dict[str, Any]

class AutomationResponse(BaseModel):
    id: int
    name: str
    description: str
    type: str
    config: Dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

class AutomationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class AutomationExecutionResponse(BaseModel):
    id: int
    automation_id: int
    status: str
    result: Optional[Dict[str, Any]]
    error_message: Optional[str]
    started_at: datetime
    completed_at: Optional[datetime]

class AutomationSuggestionRequest(BaseModel):
    description: str

# Endpoints
@router.post("/", response_model=AutomationResponse)
async def create_automation(
    automation: AutomationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria uma nova automação"""
    db_automation = Automation(
        user_id=current_user.id,
        name=automation.name,
        description=automation.description,
        type=automation.type,
        config=automation.config
    )
    db.add(db_automation)
    db.commit()
    db.refresh(db_automation)
    return db_automation

@router.get("/", response_model=List[AutomationResponse])
async def get_automations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    type_filter: Optional[str] = None,
    active_only: bool = False
):
    """Lista todas as automações do usuário"""
    query = db.query(Automation).filter(Automation.user_id == current_user.id)
    
    if type_filter:
        query = query.filter(Automation.type == type_filter)
    
    if active_only:
        query = query.filter(Automation.is_active == True)
    
    automations = query.order_by(Automation.created_at.desc()).all()
    return automations

@router.get("/{automation_id}", response_model=AutomationResponse)
async def get_automation(
    automation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém uma automação específica"""
    automation = db.query(Automation).filter(
        Automation.id == automation_id,
        Automation.user_id == current_user.id
    ).first()
    
    if not automation:
        raise HTTPException(status_code=404, detail="Automação não encontrada")
    
    return automation

@router.put("/{automation_id}", response_model=AutomationResponse)
async def update_automation(
    automation_id: int,
    automation_update: AutomationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza uma automação"""
    automation = db.query(Automation).filter(
        Automation.id == automation_id,
        Automation.user_id == current_user.id
    ).first()
    
    if not automation:
        raise HTTPException(status_code=404, detail="Automação não encontrada")
    
    update_data = automation_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(automation, field, value)
    
    automation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(automation)
    return automation

@router.delete("/{automation_id}")
async def delete_automation(
    automation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deleta uma automação"""
    automation = db.query(Automation).filter(
        Automation.id == automation_id,
        Automation.user_id == current_user.id
    ).first()
    
    if not automation:
        raise HTTPException(status_code=404, detail="Automação não encontrada")
    
    db.delete(automation)
    db.commit()
    return {"message": "Automação deletada com sucesso"}

@router.post("/{automation_id}/execute")
async def execute_automation(
    automation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Executa uma automação manualmente"""
    automation = db.query(Automation).filter(
        Automation.id == automation_id,
        Automation.user_id == current_user.id
    ).first()
    
    if not automation:
        raise HTTPException(status_code=404, detail="Automação não encontrada")
    
    if not automation.is_active:
        raise HTTPException(status_code=400, detail="Automação está inativa")
    
    # Criar registro de execução
    execution = AutomationExecution(
        automation_id=automation_id,
        status="running"
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)
    
    try:
        # Executar automação baseada no tipo
        result = await execute_automation_by_type(automation, current_user)
        
        # Atualizar status
        execution.status = "completed"
        execution.result = result
        execution.completed_at = datetime.utcnow()
        
    except Exception as e:
        execution.status = "failed"
        execution.error_message = str(e)
        execution.completed_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Automação executada", "execution_id": execution.id}

@router.get("/{automation_id}/executions", response_model=List[AutomationExecutionResponse])
async def get_automation_executions(
    automation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """Lista execuções de uma automação"""
    automation = db.query(Automation).filter(
        Automation.id == automation_id,
        Automation.user_id == current_user.id
    ).first()
    
    if not automation:
        raise HTTPException(status_code=404, detail="Automação não encontrada")
    
    executions = db.query(AutomationExecution).filter(
        AutomationExecution.automation_id == automation_id
    ).order_by(AutomationExecution.started_at.desc()).limit(limit).all()
    
    return executions

@router.post("/suggest")
async def suggest_automation(
    request: AutomationSuggestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sugere uma automação baseada na descrição do usuário"""
    ai_service = AIService()
    
    user_data = {
        "user_id": current_user.id,
        "username": current_user.username,
        "existing_automations": [
            {"name": a.name, "type": a.type}
            for a in db.query(Automation).filter(Automation.user_id == current_user.id).all()
        ]
    }
    
    suggestion = await ai_service.suggest_automation(request.description, user_data)
    return suggestion

@router.get("/types/available")
async def get_available_automation_types():
    """Lista tipos de automação disponíveis"""
    return {
        "message": {
            "name": "Automação de Mensagens",
            "description": "Envio automático de emails, SMS ou WhatsApp",
            "config_fields": [
                {"name": "trigger", "type": "select", "options": ["new_customer", "payment_received", "scheduled"]},
                {"name": "template", "type": "text", "required": True},
                {"name": "delay", "type": "number", "default": 0}
            ]
        },
        "payment": {
            "name": "Automação de Pagamentos",
            "description": "Processamento automático de pagamentos e cobranças",
            "config_fields": [
                {"name": "amount", "type": "number", "required": True},
                {"name": "frequency", "type": "select", "options": ["once", "daily", "weekly", "monthly"]},
                {"name": "payment_method", "type": "select", "options": ["credit_card", "pix", "bank_transfer"]}
            ]
        },
        "deposit": {
            "name": "Automação de Depósitos",
            "description": "Transferências automáticas entre contas",
            "config_fields": [
                {"name": "source_account", "type": "text", "required": True},
                {"name": "target_account", "type": "text", "required": True},
                {"name": "amount", "type": "number", "required": True},
                {"name": "frequency", "type": "select", "options": ["daily", "weekly", "monthly"]}
            ]
        },
        "report": {
            "name": "Automação de Relatórios",
            "description": "Geração automática de relatórios",
            "config_fields": [
                {"name": "report_type", "type": "select", "options": ["sales", "financial", "customer"]},
                {"name": "frequency", "type": "select", "options": ["daily", "weekly", "monthly"]},
                {"name": "recipients", "type": "array", "required": True}
            ]
        }
    }

async def execute_automation_by_type(automation: Automation, user: User) -> Dict[str, Any]:
    """Executa automação baseada no tipo"""
    if automation.type == "message":
        return await execute_message_automation(automation, user)
    elif automation.type == "payment":
        return await execute_payment_automation(automation, user)
    elif automation.type == "deposit":
        return await execute_deposit_automation(automation, user)
    elif automation.type == "report":
        return await execute_report_automation(automation, user)
    else:
        raise ValueError(f"Tipo de automação não suportado: {automation.type}")

async def execute_message_automation(automation: Automation, user: User) -> Dict[str, Any]:
    """Executa automação de mensagem"""
    config = automation.config
    
    # Simulação de envio de mensagem
    return {
        "type": "message_sent",
        "template": config.get("template", ""),
        "recipients_count": 1,
        "status": "success"
    }

async def execute_payment_automation(automation: Automation, user: User) -> Dict[str, Any]:
    """Executa automação de pagamento"""
    config = automation.config
    
    # Simulação de processamento de pagamento
    return {
        "type": "payment_processed",
        "amount": config.get("amount", 0),
        "payment_method": config.get("payment_method", ""),
        "status": "success"
    }

async def execute_deposit_automation(automation: Automation, user: User) -> Dict[str, Any]:
    """Executa automação de depósito"""
    config = automation.config
    
    # Simulação de transferência
    return {
        "type": "transfer_completed",
        "amount": config.get("amount", 0),
        "source": config.get("source_account", ""),
        "target": config.get("target_account", ""),
        "status": "success"
    }

async def execute_report_automation(automation: Automation, user: User) -> Dict[str, Any]:
    """Executa automação de relatório"""
    config = automation.config
    
    # Simulação de geração de relatório
    return {
        "type": "report_generated",
        "report_type": config.get("report_type", ""),
        "recipients": config.get("recipients", []),
        "status": "success"
    }