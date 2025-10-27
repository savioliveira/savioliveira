from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import stripe
import os

from database import get_db
from models import Payment, User
from routers.auth import get_current_user

router = APIRouter()

# Configurar Stripe (se disponível)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Schemas
class PaymentCreate(BaseModel):
    amount: float
    currency: str = "BRL"
    payment_method: str
    description: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    amount: float
    currency: str
    status: str
    payment_method: str
    external_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_id: int

class PixPaymentRequest(BaseModel):
    amount: float
    description: Optional[str] = None

class PixPaymentResponse(BaseModel):
    qr_code: str
    pix_key: str
    amount: float
    expiration: datetime

# Endpoints
@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria um novo pagamento"""
    db_payment = Payment(
        user_id=current_user.id,
        amount=payment.amount,
        currency=payment.currency,
        payment_method=payment.payment_method,
        status="pending",
        metadata={"description": payment.description} if payment.description else {}
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/", response_model=List[PaymentResponse])
async def get_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    limit: int = 50
):
    """Lista pagamentos do usuário"""
    query = db.query(Payment).filter(Payment.user_id == current_user.id)
    
    if status:
        query = query.filter(Payment.status == status)
    
    payments = query.order_by(Payment.created_at.desc()).limit(limit).all()
    return payments

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém um pagamento específico"""
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    
    return payment

@router.post("/stripe/create-intent", response_model=PaymentIntentResponse)
async def create_stripe_payment_intent(
    payment: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria um Payment Intent do Stripe"""
    if not stripe.api_key:
        raise HTTPException(status_code=501, detail="Stripe não configurado")
    
    try:
        # Criar pagamento no banco
        db_payment = Payment(
            user_id=current_user.id,
            amount=payment.amount,
            currency=payment.currency,
            payment_method="credit_card",
            status="pending"
        )
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        
        # Criar Payment Intent no Stripe
        intent = stripe.PaymentIntent.create(
            amount=int(payment.amount * 100),  # Stripe usa centavos
            currency=payment.currency.lower(),
            metadata={
                "payment_id": str(db_payment.id),
                "user_id": str(current_user.id)
            }
        )
        
        # Atualizar com ID externo
        db_payment.external_id = intent.id
        db.commit()
        
        return PaymentIntentResponse(
            client_secret=intent.client_secret,
            payment_id=db_payment.id
        )
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/pix/create", response_model=PixPaymentResponse)
async def create_pix_payment(
    pix_request: PixPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria um pagamento PIX"""
    # Criar pagamento no banco
    db_payment = Payment(
        user_id=current_user.id,
        amount=pix_request.amount,
        currency="BRL",
        payment_method="pix",
        status="pending",
        metadata={"description": pix_request.description} if pix_request.description else {}
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    
    # Simular geração de QR Code PIX
    # Em produção, integraria com um gateway como PagSeguro, Mercado Pago, etc.
    qr_code = f"00020126580014br.gov.bcb.pix0136{current_user.id}-{db_payment.id}0208AI Automation520400005303986540{pix_request.amount:.2f}5802BR5913AI Automation6009SAO PAULO62070503***6304"
    
    return PixPaymentResponse(
        qr_code=qr_code,
        pix_key=f"{current_user.id}-{db_payment.id}",
        amount=pix_request.amount,
        expiration=datetime.utcnow().replace(hour=23, minute=59, second=59)
    )

@router.post("/{payment_id}/confirm")
async def confirm_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Confirma um pagamento (para simulação)"""
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    
    if payment.status != "pending":
        raise HTTPException(status_code=400, detail="Pagamento não pode ser confirmado")
    
    payment.status = "completed"
    payment.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Pagamento confirmado com sucesso"}

@router.post("/{payment_id}/cancel")
async def cancel_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancela um pagamento"""
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    
    if payment.status not in ["pending"]:
        raise HTTPException(status_code=400, detail="Pagamento não pode ser cancelado")
    
    payment.status = "cancelled"
    payment.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Pagamento cancelado com sucesso"}

@router.post("/webhook/stripe")
async def stripe_webhook(
    request: dict,
    db: Session = Depends(get_db)
):
    """Webhook para eventos do Stripe"""
    if not stripe.api_key:
        raise HTTPException(status_code=501, detail="Stripe não configurado")
    
    # Em produção, verificar assinatura do webhook
    event_type = request.get("type")
    
    if event_type == "payment_intent.succeeded":
        payment_intent = request["data"]["object"]
        external_id = payment_intent["id"]
        
        # Encontrar pagamento no banco
        payment = db.query(Payment).filter(Payment.external_id == external_id).first()
        if payment:
            payment.status = "completed"
            payment.updated_at = datetime.utcnow()
            db.commit()
    
    elif event_type == "payment_intent.payment_failed":
        payment_intent = request["data"]["object"]
        external_id = payment_intent["id"]
        
        # Encontrar pagamento no banco
        payment = db.query(Payment).filter(Payment.external_id == external_id).first()
        if payment:
            payment.status = "failed"
            payment.updated_at = datetime.utcnow()
            db.commit()
    
    return {"status": "received"}

@router.get("/stats/summary")
async def get_payment_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém estatísticas de pagamentos"""
    from sqlalchemy import func
    
    # Total de pagamentos
    total_payments = db.query(func.count(Payment.id)).filter(
        Payment.user_id == current_user.id
    ).scalar()
    
    # Total em valor
    total_amount = db.query(func.sum(Payment.amount)).filter(
        Payment.user_id == current_user.id,
        Payment.status == "completed"
    ).scalar() or 0
    
    # Pagamentos por status
    payments_by_status = db.query(
        Payment.status,
        func.count(Payment.id).label("count")
    ).filter(
        Payment.user_id == current_user.id
    ).group_by(Payment.status).all()
    
    # Pagamentos por método
    payments_by_method = db.query(
        Payment.payment_method,
        func.count(Payment.id).label("count")
    ).filter(
        Payment.user_id == current_user.id
    ).group_by(Payment.payment_method).all()
    
    return {
        "total_payments": total_payments,
        "total_amount": total_amount,
        "by_status": {status: count for status, count in payments_by_status},
        "by_method": {method: count for method, count in payments_by_method}
    }