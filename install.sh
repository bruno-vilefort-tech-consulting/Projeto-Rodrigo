#!/bin/bash

# Script de instalação automatizada com Docker
# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}    Instalador Automático - ChatIA${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para instalar Docker
install_docker() {
    echo -e "${YELLOW}Instalando Docker...${NC}"

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Atualizar repositórios
        sudo apt-get update

        # Instalar dependências
        sudo apt-get install -y \
            apt-transport-https \
            ca-certificates \
            curl \
            gnupg \
            lsb-release

        # Adicionar chave GPG oficial do Docker
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

        # Adicionar repositório Docker
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

        # Instalar Docker
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io

        # Adicionar usuário ao grupo docker
        sudo usermod -aG docker $USER

        echo -e "${GREEN}Docker instalado com sucesso!${NC}"
    else
        echo -e "${RED}Sistema operacional não suportado. Instale o Docker manualmente.${NC}"
        exit 1
    fi
}

# Função para instalar Docker Compose
install_docker_compose() {
    echo -e "${YELLOW}Instalando Docker Compose...${NC}"

    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    echo -e "${GREEN}Docker Compose instalado com sucesso!${NC}"
}

# Verificar e instalar Docker se necessário
if ! command_exists docker; then
    echo -e "${YELLOW}Docker não encontrado.${NC}"
    read -p "Deseja instalar o Docker? (s/n): " install_docker_choice
    if [[ $install_docker_choice == "s" || $install_docker_choice == "S" ]]; then
        install_docker
    else
        echo -e "${RED}Docker é necessário para continuar. Abortando...${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Docker já está instalado${NC}"
fi

# Verificar e instalar Docker Compose se necessário
if ! command_exists docker-compose; then
    echo -e "${YELLOW}Docker Compose não encontrado.${NC}"
    read -p "Deseja instalar o Docker Compose? (s/n): " install_compose_choice
    if [[ $install_compose_choice == "s" || $install_compose_choice == "S" ]]; then
        install_docker_compose
    else
        echo -e "${RED}Docker Compose é necessário para continuar. Abortando...${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Docker Compose já está instalado${NC}"
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}    Configuração do Projeto${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Coletar informações
read -p "URL do repositório GitHub: " GITHUB_URL
read -p "Token do GitHub (deixe em branco se público): " GITHUB_TOKEN
read -p "Nome da empresa: " COMPANY_NAME
read -p "URL do backend (ex: https://api.seudominio.com): " BACKEND_URL
read -p "URL do frontend (ex: https://seudominio.com): " FRONTEND_URL
read -p "Email do admin: " ADMIN_EMAIL
read -sp "Senha do admin: " ADMIN_PASSWORD
echo ""
read -sp "Senha do banco de dados PostgreSQL: " DB_PASSWORD
echo ""
read -sp "Senha do banco de dados Redis: " REDIS_PASSWORD
echo ""
read -p "Telefone de contato: " CONTACT_PHONE

# Diretório de instalação
INSTALL_DIR="/opt/chatia"
read -p "Diretório de instalação [${INSTALL_DIR}]: " custom_dir
if [ ! -z "$custom_dir" ]; then
    INSTALL_DIR=$custom_dir
fi

echo ""
echo -e "${YELLOW}Criando diretório de instalação...${NC}"
sudo mkdir -p $INSTALL_DIR
sudo chown -R $USER:$USER $INSTALL_DIR
cd $INSTALL_DIR

# Clonar repositório
echo -e "${YELLOW}Clonando repositório...${NC}"
if [ -z "$GITHUB_TOKEN" ]; then
    git clone $GITHUB_URL .
else
    # Extrair o domínio e caminho do repositório
    REPO_PATH=$(echo $GITHUB_URL | sed 's|https://||' | sed 's|http://||')
    git clone https://${GITHUB_TOKEN}@${REPO_PATH} .
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao clonar repositório. Verifique a URL e o token.${NC}"
    exit 1
fi

echo -e "${GREEN}Repositório clonado com sucesso!${NC}"

# Verificar se os arquivos Docker já existem
echo -e "${YELLOW}Verificando arquivos Docker...${NC}"
if [ ! -f "docker-compose.yml" ] || [ ! -f "frontend/Dockerfile" ] || [ ! -f "backend/Dockerfile" ]; then
    echo -e "${RED}ERRO: Arquivos Docker não encontrados no repositório!${NC}"
    echo -e "${YELLOW}Certifique-se de que o repositório contém:${NC}"
    echo "  - docker-compose.yml"
    echo "  - frontend/Dockerfile"
    echo "  - frontend/nginx.conf"
    echo "  - backend/Dockerfile"
    exit 1
fi
echo -e "${GREEN}✓ Arquivos Docker encontrados${NC}"

# Criar arquivo .env na raiz (para docker-compose)
echo -e "${YELLOW}Criando arquivos de configuração...${NC}"

# Gerar secrets JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

cat > .env << EOF
# ========================================
# CONFIGURAÇÃO GERAL
# ========================================

# URLs da aplicação
BACKEND_URL=${BACKEND_URL}
FRONTEND_URL=${FRONTEND_URL}

# ========================================
# FRONTEND (React) - Build Args
# ========================================

REACT_APP_BACKEND_URL=${BACKEND_URL}
REACT_APP_NAME_SYSTEM=${COMPANY_NAME}
REACT_APP_COMPANY_NAME=${COMPANY_NAME}
REACT_APP_NUMBER_SUPPORT=${CONTACT_PHONE}
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=9999
REACT_APP_PRIMARY_COLOR=#6B46C1
REACT_APP_PRIMARY_DARK=#4C1D95
REACT_APP_FACEBOOK_APP_ID=
REACT_APP_REQUIRE_BUSINESS_MANAGEMENT=FALSE

# ========================================
# BANCO DE DADOS (PostgreSQL)
# ========================================

DB_NAME=chatia
DB_USER=chatia
DB_PASS=${DB_PASSWORD}
DB_HOST=postgres
DB_PORT=5432
DB_DIALECT=postgres
DB_POOL_MAX=100
DB_POOL_MIN=15
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=600000

# ========================================
# REDIS
# ========================================

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=0
IO_REDIS_SERVER=redis
IO_REDIS_PORT=6379
IO_REDIS_PASSWORD=${REDIS_PASSWORD}
EOF

echo -e "${GREEN}✓ Arquivo .env na raiz criado${NC}"

# Criar arquivo .env para o backend
if [ -d "backend" ]; then
    cat > backend/.env << EOF
# Environment
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# URLs
BACKEND_URL=${BACKEND_URL}
FRONTEND_URL=${FRONTEND_URL}

# Database
DB_DIALECT=postgres
DB_HOST=postgres
DB_PORT=5432
DB_USER=chatia
DB_PASS=${DB_PASSWORD}
DB_NAME=chatia
DB_POOL_MAX=100
DB_POOL_MIN=15
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=600000

# Redis
IO_REDIS_SERVER=redis
IO_REDIS_PORT=6379
IO_REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=0
REDIS_SECRET_KEY=MULTI100
REDIS_OPT_LIMITER_MAX=1
REDIS_OPT_LIMITER_DURATION=3000

# JWT Secrets
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}

# Admin
ADMIN_USERNAME=${ADMIN_EMAIL}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}

# Company
COMPANY_NAME=${COMPANY_NAME}
CONTACT_PHONE=${CONTACT_PHONE}

# WhatsApp
SESSION_SECRET=$(openssl rand -base64 32)

# Storage
STORAGE_TYPE=local

# Logs
LOG_LEVEL=info

# FFmpeg
FFMPEG_PATH=/usr/bin/ffmpeg
EOF
    echo -e "${GREEN}✓ Arquivo backend/.env criado${NC}"
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}    Iniciando containers...${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Construir e iniciar containers
docker-compose build
docker-compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}    Instalação concluída com sucesso!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "${GREEN}Frontend:${NC} http://localhost"
    if [ -d "backend" ]; then
        echo -e "${GREEN}Backend:${NC} http://localhost:3000"
    fi
    echo ""
    echo -e "${YELLOW}Para ver os logs:${NC} docker-compose logs -f"
    echo -e "${YELLOW}Para parar:${NC} docker-compose stop"
    echo -e "${YELLOW}Para reiniciar:${NC} docker-compose restart"
    echo ""
    echo -e "${BLUE}Credenciais de acesso:${NC}"
    echo -e "Email: ${ADMIN_EMAIL}"
    echo -e "Senha: ${ADMIN_PASSWORD}"
    echo ""
else
    echo -e "${RED}Erro ao iniciar containers. Verifique os logs com: docker-compose logs${NC}"
    exit 1
fi
