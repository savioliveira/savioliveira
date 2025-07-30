#!/usr/bin/env python3
"""
Script para executar o sistema AI Automation
"""

import os
import sys
import subprocess
import threading
import time
from pathlib import Path

def run_backend():
    """Executa o backend FastAPI"""
    print("🚀 Iniciando backend...")
    os.chdir("backend")
    subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"])

def run_frontend():
    """Executa o frontend React"""
    print("🎨 Iniciando frontend...")
    time.sleep(3)  # Aguarda o backend iniciar
    os.chdir("frontend")
    subprocess.run(["npm", "run", "dev"])

def check_dependencies():
    """Verifica se as dependências estão instaladas"""
    print("🔍 Verificando dependências...")
    
    # Verificar Python
    try:
        import uvicorn
        import fastapi
        print("✅ Dependências Python OK")
    except ImportError:
        print("❌ Dependências Python não encontradas. Execute: pip install -r requirements.txt")
        return False
    
    # Verificar Node.js
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Node.js OK")
        else:
            print("❌ Node.js não encontrado")
            return False
    except FileNotFoundError:
        print("❌ Node.js não encontrado")
        return False
    
    # Verificar se node_modules existe
    if not Path("frontend/node_modules").exists():
        print("📦 Instalando dependências do frontend...")
        os.chdir("frontend")
        subprocess.run(["npm", "install"])
        os.chdir("..")
    
    return True

def setup_env():
    """Configura o arquivo .env se não existir"""
    if not Path(".env").exists():
        print("⚙️ Criando arquivo .env...")
        with open(".env", "w") as f:
            f.write("""# Database
DATABASE_URL=sqlite:///./ai_automation.db

# Security
SECRET_KEY=dev-secret-key-change-in-production

# AI Services (configure pelo menos um)
# OPENAI_API_KEY=sk-sua-chave-openai
# ANTHROPIC_API_KEY=sk-ant-sua-chave-anthropic
DEFAULT_AI_MODEL=gpt-3.5-turbo

# Payment Gateways (opcional)
# STRIPE_SECRET_KEY=sk_test_sua-chave-stripe
# STRIPE_PUBLISHABLE_KEY=pk_test_sua-chave-stripe

# Configurações da aplicação
DEBUG=True
ENVIRONMENT=development
""")
        print("✅ Arquivo .env criado! Configure suas chaves de API.")

def main():
    """Função principal"""
    print("🤖 AI Automation - Sistema de Automação com IA")
    print("=" * 50)
    
    # Verificar se estamos no diretório correto
    if not Path("backend").exists() or not Path("frontend").exists():
        print("❌ Execute este script na raiz do projeto!")
        sys.exit(1)
    
    # Configurar ambiente
    setup_env()
    
    # Verificar dependências
    if not check_dependencies():
        sys.exit(1)
    
    print("\n🎯 Iniciando aplicação...")
    print("📍 Frontend: http://localhost:5173")
    print("📍 Backend API: http://localhost:8000")
    print("📍 Docs API: http://localhost:8000/docs")
    print("=" * 50)
    
    # Executar backend e frontend em threads separadas
    backend_thread = threading.Thread(target=run_backend)
    frontend_thread = threading.Thread(target=run_frontend)
    
    try:
        backend_thread.start()
        frontend_thread.start()
        
        # Aguardar as threads
        backend_thread.join()
        frontend_thread.join()
        
    except KeyboardInterrupt:
        print("\n🛑 Parando aplicação...")
        sys.exit(0)

if __name__ == "__main__":
    main()