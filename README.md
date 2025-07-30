# AI Automation - Sistema de Automação Administrativa com IA

Um sistema completo de automação administrativa que utiliza Inteligência Artificial para facilitar a configuração e gestão de processos empresariais.

## 🚀 Características Principais

### 🤖 Chat Inteligente com IA
- Conversação natural para configurar automações
- Suporte a OpenAI GPT e Anthropic Claude
- Classificação automática de intenções
- Sugestões contextuais inteligentes

### ⚙️ Automações Avançadas
- **Mensagens**: Email, SMS, WhatsApp, notificações push
- **Pagamentos**: PIX, cartão de crédito, transferências
- **Depósitos**: Transferências automáticas entre contas
- **Relatórios**: Geração automática de relatórios

### 💰 Gestão de Pagamentos
- Integração com Stripe para cartões
- Sistema PIX nativo brasileiro
- Webhooks para atualizações em tempo real
- Dashboard de estatísticas financeiras

### 📧 Templates de Mensagem
- Editor visual de templates
- Variáveis dinâmicas personalizáveis
- Pré-visualização em tempo real
- Múltiplos canais de comunicação

### 🎯 Agente Inteligente
- Escolha automática da melhor estratégia
- Especialização por área (vendas, suporte, admin)
- Análise de contexto e histórico
- Sugestões proativas de melhorias

## 🛠️ Tecnologias Utilizadas

### Backend
- **FastAPI**: Framework web moderno e rápido
- **SQLAlchemy**: ORM para banco de dados
- **OpenAI/Anthropic**: Integração com IA
- **Stripe**: Processamento de pagamentos
- **WebSockets**: Comunicação em tempo real
- **JWT**: Autenticação segura

### Frontend
- **React 18**: Interface de usuário moderna
- **Material-UI**: Componentes elegantes
- **TypeScript**: Tipagem estática
- **Zustand**: Gerenciamento de estado
- **React Hook Form**: Formulários eficientes
- **Vite**: Build tool rápido

### Banco de Dados
- **SQLite**: Desenvolvimento (padrão)
- **PostgreSQL**: Produção (suportado)
- **Redis**: Cache e filas (opcional)

## 📦 Instalação e Configuração

### Pré-requisitos
- Python 3.8+
- Node.js 16+
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <repository-url>
cd ai-automation
```

### 2. Configuração do Backend
```bash
# Instalar dependências Python
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Configuração do Frontend
```bash
cd frontend
npm install
```

### 4. Configuração das Variáveis de Ambiente
Edite o arquivo `.env` com suas configurações:

```env
# Banco de dados
DATABASE_URL=sqlite:///./ai_automation.db

# Segurança
SECRET_KEY=sua-chave-secreta-super-segura

# IA (configure pelo menos uma)
OPENAI_API_KEY=sk-sua-chave-openai
ANTHROPIC_API_KEY=sk-ant-sua-chave-anthropic

# Pagamentos (opcional)
STRIPE_SECRET_KEY=sk_test_sua-chave-stripe
STRIPE_PUBLISHABLE_KEY=pk_test_sua-chave-stripe

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
```

## 🚀 Executando a Aplicação

### Desenvolvimento

#### Backend
```bash
# Na raiz do projeto
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
# Em outro terminal
cd frontend
npm run dev
```

A aplicação estará disponível em:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Documentação API: http://localhost:8000/docs

### Produção
```bash
# Backend
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend (build)
cd frontend
npm run build
npm run preview
```

## 📱 Como Usar

### 1. Primeiro Acesso
1. Acesse http://localhost:5173
2. Crie uma conta ou faça login
3. Configure suas chaves de API em Configurações
4. Comece a conversar com a IA!

### 2. Chat com IA
- Vá para "Chat IA" no menu
- Digite suas necessidades naturalmente
- Exemplo: "Quero criar uma automação para enviar email de boas-vindas"
- A IA irá guiá-lo através do processo

### 3. Criando Automações
- Acesse "Automações" no menu
- Clique em "Nova Automação"
- Escolha o tipo e configure
- Ou peça ajuda à IA no chat!

### 4. Gerenciando Pagamentos
- Vá para "Pagamentos"
- Crie pagamentos PIX ou configure Stripe
- Acompanhe estatísticas em tempo real

### 5. Templates de Mensagem
- Acesse "Mensagens"
- Crie templates personalizados
- Use variáveis como {nome}, {email}
- Teste antes de enviar

## 🤖 Funcionalidades da IA

### Classificação Inteligente
A IA classifica automaticamente suas solicitações em:
- **Vendas**: Prospecção, leads, follow-ups
- **Suporte**: Ajuda técnica, resolução de problemas
- **Administrativo**: Configurações, relatórios
- **Pagamentos**: Transações, cobranças
- **Mensagens**: Templates, comunicação

### Agentes Especializados
Cada tipo de solicitação é direcionada para um agente especializado:
- **Agente de Vendas**: Foca em conversão e relacionamento
- **Agente de Suporte**: Resolve problemas tecnicamente
- **Agente Administrativo**: Otimiza processos internos
- **Agente Financeiro**: Gerencia transações com segurança
- **Agente de Comunicação**: Cria mensagens envolventes

### Sugestões Contextuais
- Analisa o histórico da conversa
- Oferece próximos passos relevantes
- Sugere otimizações baseadas no uso
- Aprende com suas preferências

## 🔧 Configurações Avançadas

### Banco de Dados PostgreSQL
```env
DATABASE_URL=postgresql://user:password@localhost/ai_automation
```

### Redis para Cache
```env
REDIS_URL=redis://localhost:6379
```

### Configuração de Email
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
```

### Webhooks Stripe
Configure o endpoint webhook: `https://seu-dominio.com/api/payments/webhook/stripe`

## 📊 Monitoramento e Logs

### Logs da Aplicação
- Backend: Logs automáticos via FastAPI
- Frontend: Console do navegador
- Banco: Logs de query (desenvolvimento)

### Métricas Disponíveis
- Número de automações ativas
- Volume de pagamentos processados
- Templates de mensagem utilizados
- Conversas com IA por período

## 🔒 Segurança

### Autenticação
- JWT tokens com expiração
- Senhas hasheadas com bcrypt
- Proteção contra CSRF
- Rate limiting nas APIs

### Dados Sensíveis
- Chaves de API criptografadas
- Dados de pagamento tokenizados
- Logs sanitizados
- Backup seguro do banco

## 🚀 Deploy

### Docker (Recomendado)
```dockerfile
# Dockerfile exemplo
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Heroku
```bash
# Procfile
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Vercel (Frontend)
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ]
}
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

### Documentação
- API Docs: http://localhost:8000/docs
- Chat com IA: Use o sistema para tirar dúvidas!

### Problemas Comuns

**IA não responde:**
- Verifique se as chaves de API estão configuradas
- Confirme se há saldo na conta da API
- Veja os logs do backend para erros

**Erro de banco de dados:**
- Verifique a string de conexão
- Confirme se o banco está acessível
- Rode as migrações se necessário

**Frontend não carrega:**
- Verifique se o backend está rodando
- Confirme as configurações de proxy
- Limpe o cache do navegador

### Contato
- 🐛 Bugs: Abra uma issue no GitHub
- 💡 Sugestões: Use o chat com IA
- 📧 Email: [seu-email@exemplo.com]

---

**Desenvolvido com ❤️ usando IA para automatizar o futuro dos negócios!**
