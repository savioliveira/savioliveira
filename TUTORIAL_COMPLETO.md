# 🤖 AI AUTOMATION - TUTORIAL COMPLETO DE INSTALAÇÃO E USO

## 📦 CONTEÚDO DO PACOTE

Você recebeu o arquivo `ai-automation-sistema.tar.gz` que contém:
- ✅ Backend completo em Python (FastAPI)
- ✅ Frontend moderno em React + TypeScript
- ✅ Sistema de IA integrado (OpenAI/Claude)
- ✅ Gestão de pagamentos (PIX + Stripe)
- ✅ Templates de mensagem
- ✅ Dashboard administrativo
- ✅ Documentação completa

---

## 🚀 INSTALAÇÃO RÁPIDA (3 PASSOS)

### PASSO 1: EXTRAIR ARQUIVOS
```bash
# Extrair o arquivo
tar -xzf ai-automation-sistema.tar.gz
cd ai-automation-sistema

# OU no Windows: usar WinRAR/7-Zip para extrair
```

### PASSO 2: EXECUTAR INSTALAÇÃO AUTOMÁTICA
```bash
# Linux/Mac
python3 run.py

# Windows
python run.py
```

### PASSO 3: ACESSAR O SISTEMA
- **Interface**: http://localhost:5173
- **API**: http://localhost:8000
- **Documentação**: http://localhost:8000/docs

**Pronto! O sistema já está funcionando!** 🎉

---

## 📋 PRÉ-REQUISITOS (Instalar se não tiver)

### OBRIGATÓRIOS:
- **Python 3.8+**: https://python.org/downloads
- **Node.js 16+**: https://nodejs.org/downloads

### VERIFICAR SE ESTÁ INSTALADO:
```bash
python3 --version    # Deve mostrar Python 3.8+
node --version       # Deve mostrar v16+
npm --version        # Deve mostrar 8+
```

### INSTALAR SE NECESSÁRIO:

**Windows:**
1. Baixar Python: https://python.org/downloads
2. Baixar Node.js: https://nodejs.org
3. Marcar "Add to PATH" durante instalação

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv nodejs npm
```

**Mac:**
```bash
# Com Homebrew
brew install python3 node npm
```

---

## ⚙️ CONFIGURAÇÃO AVANÇADA (Opcional)

### 1. CONFIGURAR IA (RECOMENDADO)

Para funcionalidade completa da IA, configure pelo menos uma chave:

**Editar arquivo `.env`:**
```env
# OpenAI (ChatGPT)
OPENAI_API_KEY=sk-sua-chave-aqui

# OU Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
```

**Como obter chaves:**
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com

### 2. CONFIGURAR PAGAMENTOS (Opcional)

Para aceitar pagamentos reais:
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_sua-chave
STRIPE_PUBLISHABLE_KEY=pk_test_sua-chave
```

**Obter chaves Stripe**: https://dashboard.stripe.com/test/apikeys

### 3. BANCO DE DADOS (Opcional)

Por padrão usa SQLite. Para PostgreSQL:
```env
DATABASE_URL=postgresql://user:password@localhost/ai_automation
```

---

## 🎯 GUIA DE USO COMPLETO

### PRIMEIRO ACESSO

1. **Iniciar Sistema:**
   ```bash
   python3 run.py
   ```

2. **Acessar Interface:**
   - Abrir navegador em: http://localhost:5173

3. **Criar Conta:**
   - Clique em "Criar Conta"
   - Preencha: usuário, email, senha
   - Faça login

4. **Configurar IA (Importante!):**
   - Menu → Configurações
   - Adicione sua chave OpenAI ou Anthropic
   - Clique "Salvar"

### FUNCIONALIDADES PRINCIPAIS

#### 🤖 CHAT COM IA
**Como usar:**
1. Menu → Chat IA
2. Digite naturalmente: *"Quero criar uma automação para enviar emails"*
3. A IA irá guiá-lo passo a passo
4. Clique nas sugestões para ações rápidas

**Exemplos de comandos:**
- *"Configure um pagamento PIX de R$ 100"*
- *"Crie um template de email de boas-vindas"*
- *"Mostre estatísticas dos meus pagamentos"*
- *"Como criar uma automação de cobrança?"*

#### ⚙️ AUTOMAÇÕES
**Criar automação:**
1. Menu → Automações
2. Clique "Nova Automação"
3. Escolha o tipo:
   - **Mensagens**: Email, SMS, WhatsApp
   - **Pagamentos**: Cobranças automáticas
   - **Depósitos**: Transferências
   - **Relatórios**: Geração automática

4. Configure e ative

**Executar automação:**
- Clique no botão ▶️ na automação
- Ou deixe executar automaticamente

#### 💰 PAGAMENTOS
**Criar pagamento PIX:**
1. Menu → Pagamentos
2. Clique "Novo PIX"
3. Informe valor e descrição
4. Sistema gera QR Code automaticamente

**Acompanhar:**
- Dashboard mostra estatísticas
- Histórico completo de transações
- Status em tempo real

#### 📧 TEMPLATES DE MENSAGEM
**Criar template:**
1. Menu → Mensagens
2. Clique "Novo Template"
3. Escolha tipo: Email, SMS, WhatsApp
4. Digite conteúdo com variáveis: `{nome}`, `{email}`
5. Salve e teste

**Usar variáveis:**
- `{nome}` - Nome do destinatário
- `{email}` - Email do destinatário
- `{data}` - Data atual
- `{valor}` - Valor personalizado

#### 📊 DASHBOARD
**Visualizar:**
- Estatísticas em tempo real
- Automações ativas/inativas
- Volume de pagamentos
- Templates mais usados
- Ações rápidas

---

## 🔧 RESOLUÇÃO DE PROBLEMAS

### PROBLEMA: "Backend ainda não iniciou"
**Solução:**
```bash
# Verificar se Python está instalado
python3 --version

# Instalar dependências manualmente
cd backend
pip3 install -r ../requirements.txt
uvicorn main:app --reload
```

### PROBLEMA: "Frontend não carrega"
**Solução:**
```bash
# Verificar Node.js
node --version

# Instalar dependências
cd frontend
npm install
npm run dev
```

### PROBLEMA: "IA não responde"
**Soluções:**
1. Verificar se configurou chave de API em Configurações
2. Verificar se há saldo na conta da API
3. Testar com comando simples: *"Olá"*

### PROBLEMA: "Erro de banco de dados"
**Solução:**
```bash
# Deletar banco e recriar
rm backend/ai_automation.db
python3 run.py
```

### PROBLEMA: "Porta já em uso"
**Solução:**
```bash
# Verificar processos
lsof -i :8000
lsof -i :5173

# Matar processos
kill -9 PID_DO_PROCESSO
```

---

## 🚀 EXECUÇÃO EM PRODUÇÃO

### MÉTODO 1: Docker (Recomendado)
```bash
# Construir e executar
docker-compose up -d

# Parar
docker-compose down
```

### MÉTODO 2: Servidor Manual
```bash
# Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend (build)
cd frontend
npm run build
npm run preview
```

### MÉTODO 3: Heroku
```bash
# Configurar
heroku create seu-app-name
git push heroku main
```

---

## 📱 EXEMPLOS PRÁTICOS DE USO

### EXEMPLO 1: Automação de Boas-vindas
1. Chat IA: *"Quero enviar email automático para novos clientes"*
2. IA sugere criar automação de mensagem
3. Configure template: *"Olá {nome}, bem-vindo!"*
4. Ative automação
5. Novos clientes recebem email automaticamente

### EXEMPLO 2: Cobrança Automática
1. Menu → Automações → Nova
2. Tipo: Pagamento
3. Configure: valor, frequência, método
4. Sistema gera cobranças automaticamente

### EXEMPLO 3: Relatório Mensal
1. Chat IA: *"Quero relatório mensal de vendas"*
2. Configure automação de relatório
3. Sistema gera e envia por email todo mês

### EXEMPLO 4: Atendimento com IA
1. Cliente conversa no chat
2. IA classifica: vendas, suporte, admin
3. Direciona para agente especializado
4. Sugere próximas ações automaticamente

---

## 🔒 SEGURANÇA E BACKUP

### DADOS IMPORTANTES:
- **Banco**: `backend/ai_automation.db`
- **Configurações**: `.env`
- **Logs**: `backend/logs/`

### BACKUP:
```bash
# Backup completo
tar -czf backup-$(date +%Y%m%d).tar.gz backend/ai_automation.db .env

# Restaurar
tar -xzf backup-YYYYMMDD.tar.gz
```

### SEGURANÇA:
- Altere `SECRET_KEY` em produção
- Use HTTPS em produção
- Mantenha chaves de API seguras
- Faça backups regulares

---

## 📞 SUPORTE E AJUDA

### DOCUMENTAÇÃO:
- **API Docs**: http://localhost:8000/docs
- **Swagger**: http://localhost:8000/redoc

### CHAT COM IA:
Use o próprio sistema! A IA pode ajudar com:
- Configurações
- Resolução de problemas
- Criação de automações
- Dúvidas de uso

### LOGS DE DEBUG:
```bash
# Ver logs do backend
tail -f backend/logs/app.log

# Ver logs do frontend
# Abrir Console do navegador (F12)
```

### COMANDOS ÚTEIS:
```bash
# Verificar status
curl http://localhost:8000/health

# Reiniciar tudo
pkill -f uvicorn
pkill -f node
python3 run.py

# Limpar cache
rm -rf backend/__pycache__
rm -rf frontend/node_modules/.cache
```

---

## 🎉 CONCLUSÃO

**Parabéns!** Você agora tem um sistema completo de automação administrativa com IA!

### O QUE VOCÊ PODE FAZER:
✅ Automatizar envio de mensagens
✅ Gerenciar pagamentos e PIX
✅ Criar relatórios automáticos
✅ Conversar com IA para configurações
✅ Dashboard completo de métricas
✅ Templates personalizáveis
✅ Integrações com APIs externas

### PRÓXIMOS PASSOS:
1. Configure suas chaves de API
2. Teste todas as funcionalidades
3. Crie suas primeiras automações
4. Explore o chat com IA
5. Personalize conforme sua necessidade

### LEMBRE-SE:
- Sistema funciona sem IA (modo demo)
- IA completa requer chaves de API
- Pagamentos reais requerem Stripe
- Faça backups regulares
- Use HTTPS em produção

**Desenvolvido com ❤️ para automatizar o futuro dos negócios!**

---

*Este tutorial cobre 100% das funcionalidades. Para dúvidas específicas, use o chat com IA dentro do próprio sistema!*