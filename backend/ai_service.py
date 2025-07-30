import openai
import anthropic
import json
import os
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

class AIService:
    def __init__(self):
        self.openai_client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        ) if os.getenv("OPENAI_API_KEY") else None
        
        self.anthropic_client = anthropic.AsyncAnthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY")
        ) if os.getenv("ANTHROPIC_API_KEY") else None
        
        self.default_model = os.getenv("DEFAULT_AI_MODEL", "gpt-3.5-turbo")
        
    async def process_message(self, message: str, client_id: str, context: Dict = None) -> str:
        """Processa uma mensagem do usuário e retorna resposta da IA"""
        try:
            # Determinar o tipo de solicitação
            intent = await self._classify_intent(message)
            
            # Escolher o agente apropriado baseado na intenção
            agent_prompt = self._get_agent_prompt(intent)
            
            # Gerar resposta
            response = await self._generate_response(message, agent_prompt, context)
            
            return response
            
        except Exception as e:
            return f"Desculpe, ocorreu um erro ao processar sua mensagem: {str(e)}"
    
    async def _classify_intent(self, message: str) -> str:
        """Classifica a intenção da mensagem do usuário"""
        classification_prompt = """
        Analise a mensagem do usuário e classifique a intenção em uma das categorias:
        - sales: vendas, prospecção, leads
        - support: suporte, ajuda, problemas
        - admin: configurações, automações, relatórios
        - payment: pagamentos, depósitos, transações
        - message: configuração de mensagens, templates
        - general: conversa geral, outras questões
        
        Responda apenas com a categoria.
        
        Mensagem: {message}
        """
        
        try:
            if self.openai_client:
                response = await self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": classification_prompt.format(message=message)}
                    ],
                    max_tokens=10,
                    temperature=0.1
                )
                return response.choices[0].message.content.strip().lower()
            else:
                # Fallback simples se não tiver IA configurada
                return self._simple_intent_classification(message)
                
        except Exception:
            return "general"
    
    def _simple_intent_classification(self, message: str) -> str:
        """Classificação simples baseada em palavras-chave"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["venda", "vendas", "cliente", "lead", "prospecção"]):
            return "sales"
        elif any(word in message_lower for word in ["pagamento", "pagar", "depósito", "transação", "dinheiro"]):
            return "payment"
        elif any(word in message_lower for word in ["mensagem", "template", "email", "sms", "whatsapp"]):
            return "message"
        elif any(word in message_lower for word in ["configurar", "automação", "relatório", "configuração"]):
            return "admin"
        elif any(word in message_lower for word in ["ajuda", "suporte", "problema", "erro"]):
            return "support"
        else:
            return "general"
    
    def _get_agent_prompt(self, intent: str) -> str:
        """Retorna o prompt do agente baseado na intenção"""
        prompts = {
            "sales": """
            Você é um especialista em vendas e automação comercial. Ajude o usuário a:
            - Configurar automações de vendas
            - Criar estratégias de prospecção
            - Configurar follow-ups automáticos
            - Analisar leads e oportunidades
            - Otimizar processos de vendas
            
            Seja prático e focado em resultados.
            """,
            
            "support": """
            Você é um assistente de suporte técnico especializado em automação administrativa.
            Ajude o usuário a resolver problemas e configure soluções.
            Seja claro, didático e ofereça soluções passo a passo.
            """,
            
            "admin": """
            Você é um especialista em automação administrativa. Ajude o usuário a:
            - Configurar automações
            - Criar relatórios
            - Gerenciar configurações do sistema
            - Otimizar processos administrativos
            
            Seja técnico mas acessível.
            """,
            
            "payment": """
            Você é um especialista em automação financeira. Ajude o usuário a:
            - Configurar automações de pagamento
            - Gerenciar transações
            - Configurar depósitos automáticos
            - Monitorar fluxo financeiro
            
            Seja preciso e seguro nas orientações.
            """,
            
            "message": """
            Você é um especialista em comunicação automatizada. Ajude o usuário a:
            - Criar templates de mensagens
            - Configurar automações de comunicação
            - Otimizar campanhas de email/SMS/WhatsApp
            - Personalizar mensagens
            
            Seja criativo e focado em engajamento.
            """,
            
            "general": """
            Você é um assistente inteligente para automação administrativa.
            Ajude o usuário com suas necessidades de forma amigável e eficiente.
            Ofereça sugestões práticas e seja proativo em propor soluções.
            """
        }
        
        return prompts.get(intent, prompts["general"])
    
    async def _generate_response(self, message: str, agent_prompt: str, context: Dict = None) -> str:
        """Gera resposta usando IA"""
        try:
            system_message = f"""
            {agent_prompt}
            
            Contexto adicional:
            - Sistema de automação administrativa
            - Foco em praticidade e resultados
            - Usuário brasileiro
            - Responda em português
            
            {f"Contexto da conversa: {json.dumps(context, ensure_ascii=False)}" if context else ""}
            """
            
            if self.openai_client:
                response = await self.openai_client.chat.completions.create(
                    model=self.default_model,
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": message}
                    ],
                    max_tokens=1000,
                    temperature=0.7
                )
                return response.choices[0].message.content
                
            elif self.anthropic_client:
                response = await self.anthropic_client.messages.create(
                    model="claude-3-sonnet-20240229",
                    max_tokens=1000,
                    messages=[
                        {"role": "user", "content": f"{system_message}\n\nUsuário: {message}"}
                    ]
                )
                return response.content[0].text
            
            else:
                return self._fallback_response(message)
                
        except Exception as e:
            return f"Desculpe, ocorreu um erro ao gerar a resposta: {str(e)}"
    
    def _fallback_response(self, message: str) -> str:
        """Resposta de fallback quando IA não está disponível"""
        return """
        Olá! Sou seu assistente de automação administrativa.
        
        No momento, estou operando em modo limitado. Para uma experiência completa,
        configure suas chaves de API da OpenAI ou Anthropic.
        
        Posso ajudá-lo com:
        • Configuração de automações
        • Gestão de mensagens
        • Configuração de pagamentos
        • Relatórios e análises
        
        Como posso ajudá-lo hoje?
        """
    
    async def suggest_automation(self, user_request: str, user_data: Dict) -> Dict[str, Any]:
        """Sugere automações baseadas na solicitação do usuário"""
        suggestion_prompt = f"""
        Baseado na solicitação do usuário, sugira uma automação específica.
        
        Solicitação: {user_request}
        Dados do usuário: {json.dumps(user_data, ensure_ascii=False)}
        
        Retorne um JSON com:
        {{
            "type": "tipo_automacao",
            "name": "nome_sugerido",
            "description": "descrição_detalhada",
            "config": {{
                "configurações_específicas": "valores"
            }},
            "benefits": ["benefício1", "benefício2"]
        }}
        """
        
        try:
            if self.openai_client:
                response = await self.openai_client.chat.completions.create(
                    model=self.default_model,
                    messages=[
                        {"role": "system", "content": suggestion_prompt}
                    ],
                    max_tokens=500,
                    temperature=0.3
                )
                
                return json.loads(response.choices[0].message.content)
            
        except Exception:
            pass
        
        # Fallback
        return {
            "type": "message",
            "name": "Automação de Boas-vindas",
            "description": "Envio automático de mensagem de boas-vindas para novos clientes",
            "config": {
                "trigger": "new_customer",
                "delay": "0",
                "template": "welcome_message"
            },
            "benefits": [
                "Melhora a experiência do cliente",
                "Reduz trabalho manual",
                "Aumenta engajamento"
            ]
        }