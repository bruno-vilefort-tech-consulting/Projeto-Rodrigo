# DEPLOYMENT - ChatIA Flow Backend

## Visão Geral

Este documento fornece um guia completo para deployment do ChatIA Flow Backend em ambientes de **desenvolvimento** e **produção**. O sistema suporta múltiplas estratégias de deployment: Docker Compose, PM2, Kubernetes, e instalação manual.

### Arquitetura de Deployment

```
┌─────────────────────────────────────────────────────────┐
│                    Internet / Users                      │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Nginx (Reverse Proxy)                   │
│  • SSL/TLS Termination                                  │
│  • Load Balancing                                       │
│  • Static File Serving                                  │
│  • Rate Limiting                                        │
└─────────┬──────────────────────────┬────────────────────┘
          │                          │
┌─────────▼─────────────┐  ┌─────────▼─────────────┐
│   Backend (PM2/Docker) │  │  Frontend (PM2/Docker) │
│   • Port 8080          │  │  • Port 3000           │
│   • Node.js 16+        │  │  • React 18+           │
│   • Express 4.17       │  │  • Next.js             │
└─────────┬──────────────┘  └────────────────────────┘
          │
┌─────────┴──────────────────────────┐
│         Infrastructure              │
│  ┌──────────────┐  ┌────────────┐  │
│  │ PostgreSQL 15│  │  Redis 7   │  │
│  │ Port 5432    │  │  Port 6379 │  │
│  └──────────────┘  └────────────┘  │
└─────────────────────────────────────┘
```

---

## Índice

1. [Ambientes](#1-ambientes)
2. [Requisitos do Sistema](#2-requisitos-do-sistema)
3. [Variáveis de Ambiente](#3-variáveis-de-ambiente)
4. [Development (Local)](#4-development-local)
5. [Docker Compose](#5-docker-compose)
6. [Production (PM2)](#6-production-pm2)
7. [Database Migrations](#7-database-migrations)
8. [Build Process](#8-build-process)
9. [Nginx Configuration](#9-nginx-configuration)
10. [SSL/HTTPS](#10-sslhttps)
11. [Monitoring](#11-monitoring)
12. [Backup & Recovery](#12-backup--recovery)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. AMBIENTES

### 1.1 Tipos de Ambientes

| Ambiente | Propósito | Características |
|----------|-----------|-----------------|
| **Development** | Desenvolvimento local | Hot reload, debug ativado, seeds |
| **Staging** | Testes pré-produção | Dados de teste, logs detalhados |
| **Production** | Ambiente live | Otimizado, logs mínimos, SSL |

### 1.2 Checklist por Ambiente

**Development** ✅:
- [ ] Node.js 16+ instalado
- [ ] PostgreSQL 12+ rodando
- [ ] Redis 6+ rodando
- [ ] .env configurado
- [ ] Dependências instaladas
- [ ] Migrations executadas
- [ ] Seeds aplicadas

**Production** ✅:
- [ ] PM2 configurado
- [ ] Nginx instalado
- [ ] SSL certificado válido
- [ ] Firewall configurado
- [ ] Backup automático
- [ ] Monitoring ativo
- [ ] Logs centralizados

---

## 2. REQUISITOS DO SISTEMA

### 2.1 Software

| Software | Versão Mínima | Versão Recomendada | Propósito |
|----------|---------------|-------------------|-----------|
| **Node.js** | 16.x | 18.x LTS | Runtime do backend |
| **npm** | 8.x | 9.x | Gerenciador de pacotes |
| **PostgreSQL** | 12 | 15 | Banco de dados principal |
| **Redis** | 6 | 7 | Cache e queues |
| **PM2** | 5.x | 5.x | Process manager (prod) |
| **Nginx** | 1.18 | 1.24 | Reverse proxy (prod) |
| **Git** | 2.x | 2.x | Controle de versão |

### 2.2 Hardware (Produção)

**Recomendações Mínimas**:

| Componente | Mínimo | Recomendado | Alto Tráfego |
|------------|--------|-------------|--------------|
| **CPU** | 2 cores | 4 cores | 8+ cores |
| **RAM** | 4 GB | 8 GB | 16+ GB |
| **Disco** | 20 GB SSD | 50 GB SSD | 100+ GB NVMe |
| **Rede** | 100 Mbps | 1 Gbps | 10 Gbps |

**Por Usuários Simultâneos**:

| Usuários | CPU | RAM | Disco |
|----------|-----|-----|-------|
| 100-500 | 2 cores | 4 GB | 20 GB |
| 500-2000 | 4 cores | 8 GB | 50 GB |
| 2000-10000 | 8 cores | 16 GB | 100 GB |
| 10000+ | 16+ cores | 32+ GB | 200+ GB |

---

## 3. VARIÁVEIS DE AMBIENTE

### 3.1 Arquivo .env

**Localização**: `/chatia/.env` (root do projeto)

**Template Completo** (.env.example):

```bash
# ===========================
# AMBIENTE
# ===========================
NODE_ENV=development  # development | staging | production

# ===========================
# BANCO DE DADOS PostgreSQL
# ===========================
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatia
DB_USER=chatia
DB_PASS=chatia123

# Pool de Conexões
DB_POOL_MAX=100       # Máximo de conexões
DB_POOL_MIN=15        # Mínimo de conexões
DB_POOL_ACQUIRE=30000 # Tempo máximo para adquirir conexão (ms)
DB_POOL_IDLE=600000   # Tempo máximo idle (ms)

# ===========================
# REDIS
# ===========================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=       # Deixe vazio se sem senha
REDIS_URI=redis://localhost:6379
REDIS_URI_ACK=redis://localhost:6379

# Redis Options
REDIS_OPT_LIMITER_MAX=1
REDIS_OPT_LIMITER_DURATION=3000
REDIS_SECRET_KEY=MULTI100

# ===========================
# JWT SECRETS
# ===========================
JWT_SECRET=your-secret-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production-min-32-chars

# Expiração dos tokens
JWT_EXPIRES_IN=15m     # Access token: 15 minutos
JWT_REFRESH_EXPIRES_IN=7d  # Refresh token: 7 dias

# ===========================
# URLs E PORTAS
# ===========================
BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
REACT_APP_BACKEND_URL=http://localhost:8080

# Portas dos serviços
BACKEND_PORT=8080
FRONTEND_PORT=3000
PROXY_PORT=8080

# ===========================
# WHATSAPP (Baileys)
# ===========================
# Deixe vazio para usar configurações padrão

# ===========================
# INTEGRAÇÕES
# ===========================
# OpenAI
OPENAI_API_KEY=

# Dialogflow
GOOGLE_APPLICATION_CREDENTIALS=

# Gemini
GEMINI_API_KEY=

# N8N Webhook
N8N_WEBHOOK_URL=

# Typebot
TYPEBOT_API_KEY=
TYPEBOT_URL=

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

# Asaas
ASAAS_API_KEY=
ASAAS_WALLET_ID=

# Facebook Messenger
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_VERIFY_TOKEN=

# Instagram
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=

# Bling
BLING_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_KEY=

# ===========================
# EMAIL (Nodemailer)
# ===========================
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=noreply@chatia.com

# ===========================
# SOCKET.IO
# ===========================
SOCKET_ADMIN=false         # true apenas em dev
ADMIN_USERNAME=admin
ADMIN_PASSWORD=strong_password_here

# ===========================
# LOGGING
# ===========================
LOG_LEVEL=info  # error | warn | info | debug

# ===========================
# SENTRY (Monitoring)
# ===========================
SENTRY_DSN=

# ===========================
# TIMEZONE
# ===========================
TZ=America/Sao_Paulo  # Timezone padrão

# ===========================
# SEGURANÇA
# ===========================
RATE_LIMIT_MAX=100     # Máximo de requisições por janela
RATE_LIMIT_WINDOW=60000  # Janela em ms (1 minuto)

# ===========================
# DADOS DE LOGIN PADRÃO
# ===========================
# Email: admin@admin.com
# Senha: 123456
# Empresa: Empresa 1
```

### 3.2 Validação de Variáveis

**Script de Validação** (validate-env.js):

```javascript
// /backend/scripts/validate-env.js
const requiredEnvVars = [
  'NODE_ENV',
  'DB_DIALECT',
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASS',
  'REDIS_HOST',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'BACKEND_URL',
  'FRONTEND_URL',
];

function validateEnv() {
  const missing = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Variáveis de ambiente faltando:');
    missing.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }

  console.log('✅ Todas as variáveis de ambiente necessárias estão configuradas');
}

module.exports = { validateEnv };
```

**Uso**:

```javascript
// /backend/src/server.ts
import { validateEnv } from './scripts/validate-env';

validateEnv();
// ... resto do código
```

### 3.3 Variáveis por Ambiente

**Development**:
```bash
NODE_ENV=development
BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
SOCKET_ADMIN=true
LOG_LEVEL=debug
```

**Production**:
```bash
NODE_ENV=production
BACKEND_URL=https://api.seudominio.com
FRONTEND_URL=https://app.seudominio.com
SOCKET_ADMIN=false
LOG_LEVEL=info
```

---

## 4. DEVELOPMENT (LOCAL)

### 4.1 Setup Inicial

**1. Clonar Repositório**:

```bash
git clone https://github.com/seu-usuario/chatia-flow.git
cd chatia-flow
```

**2. Instalar Dependências**:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**3. Configurar .env**:

```bash
# Copiar template
cp .env.example .env

# Editar .env com suas configurações
nano .env
```

**4. Iniciar Infraestrutura (Docker Compose)**:

```bash
# Na raiz do projeto
docker-compose up -d
```

Isso inicia:
- PostgreSQL na porta 5432
- Redis na porta 6379

**5. Executar Migrations**:

```bash
cd backend
npm run db:migrate
```

**6. Carregar Seeds (opcional)**:

```bash
npm run db:seed
```

**7. Iniciar Backend**:

```bash
npm run dev:server
```

**8. Iniciar Frontend** (em outro terminal):

```bash
cd frontend
npm run dev
```

### 4.2 Scripts Disponíveis

```json
{
  "scripts": {
    "dev:server": "ts-node-dev --respawn --transpile-only --ignore node_modules src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:migrate": "npx sequelize-cli db:migrate",
    "db:migrate:undo": "npx sequelize-cli db:migrate:undo",
    "db:seed": "npx sequelize-cli db:seed:all",
    "test": "NODE_ENV=test jest",
    "lint": "eslint src/**/*.ts"
  }
}
```

### 4.3 Hot Reload

O ambiente de desenvolvimento usa **ts-node-dev** para hot reload automático:

```bash
npm run dev:server

# Aguardando mudanças em arquivos...
# Qualquer alteração em src/ recarrega automaticamente
```

---

## 5. DOCKER COMPOSE

### 5.1 Arquivo docker-compose.yml

**Localização**: `/chatia/docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: chatia_postgres
    restart: always
    environment:
      POSTGRES_DB: ${DB_NAME:-chatia}
      POSTGRES_USER: ${DB_USER:-chatia}
      POSTGRES_PASSWORD: ${DB_PASS:-chatia123}
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-chatia}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - chatia_network

  redis:
    image: redis:7-alpine
    container_name: chatia_redis
    restart: always
    command: redis-server --appendonly yes
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - chatia_network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  chatia_network:
    driver: bridge
```

### 5.2 Comandos Docker Compose

```bash
# Iniciar serviços em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f postgres

# Parar serviços
docker-compose stop

# Parar e remover containers
docker-compose down

# Remover volumes (CUIDADO: apaga dados!)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build

# Verificar status
docker-compose ps
```

### 5.3 Verificar Saúde dos Containers

```bash
# Verificar healthcheck do PostgreSQL
docker exec chatia_postgres pg_isready -U chatia

# Verificar healthcheck do Redis
docker exec chatia_redis redis-cli ping

# Ver estatísticas de recursos
docker stats chatia_postgres chatia_redis
```

### 5.4 Docker Compose Completo (com Backend)

Para rodar backend também via Docker:

```yaml
version: '3.8'

services:
  postgres:
    # ... (mesmo de cima)

  redis:
    # ... (mesmo de cima)

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: chatia_backend
    restart: always
    ports:
      - "${BACKEND_PORT:-8080}:8080"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/public:/app/public
      - backend_logs:/app/logs
    networks:
      - chatia_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: chatia_frontend
    restart: always
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    environment:
      NODE_ENV: production
      REACT_APP_BACKEND_URL: http://backend:8080
    depends_on:
      - backend
    networks:
      - chatia_network

volumes:
  postgres_data:
  redis_data:
  backend_logs:

networks:
  chatia_network:
    driver: bridge
```

---

## 6. PRODUCTION (PM2)

### 6.1 Instalação do PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar instalação
pm2 --version
```

### 6.2 Arquivo ecosystem.config.js

**Localização**: `/chatia/ecosystem.config.js`

```javascript
const path = require("path");

// Nome da instância (baseado no diretório)
const INSTANCE = (process.env.INSTANCE_NAME || path.basename(path.resolve(__dirname)))
  .toLowerCase()
  .replace(/[^a-z0-9-_]/g, "-");

// Gera portas determinísticas por instância
function hashPort(name, base) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return base + (h % 500);
}

const BACKEND_PORT  = Number(process.env.BACKEND_PORT)  || hashPort(INSTANCE, 8000);
const FRONTEND_PORT = Number(process.env.FRONTEND_PORT) || hashPort(INSTANCE, 3001);

// Caminhos
const BACKEND_CWD   = path.join(__dirname, "backend");
const BACKEND_FILE  = path.join(__dirname, "backend", "dist", "server.js");
const FRONTEND_CWD  = path.join(__dirname, "frontend");
const FRONTEND_FILE = path.join(__dirname, "frontend", "server.js");

module.exports = {
  apps: [
    {
      // --- BACKEND ---
      name: `${INSTANCE}-backend`,
      script: BACKEND_FILE,
      cwd: BACKEND_CWD,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      exp_backoff_restart_delay: 200,
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: String(BACKEND_PORT)
      },
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    },
    {
      // --- FRONTEND ---
      name: `${INSTANCE}-frontend`,
      script: FRONTEND_FILE,
      cwd: FRONTEND_CWD,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      exp_backoff_restart_delay: 200,
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: String(FRONTEND_PORT)
      }
    }
  ]
};
```

### 6.3 Comandos PM2

```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Listar processos
pm2 list

# Ver logs
pm2 logs

# Ver logs de um processo específico
pm2 logs empresa01-backend

# Parar aplicação
pm2 stop empresa01-backend

# Reiniciar aplicação
pm2 restart empresa01-backend

# Reload (zero-downtime)
pm2 reload empresa01-backend

# Deletar processo
pm2 delete empresa01-backend

# Monitorar recursos
pm2 monit

# Ver informações detalhadas
pm2 show empresa01-backend

# Salvar configuração atual
pm2 save

# Configurar auto-start no boot
pm2 startup
# Executar o comando exibido
```

### 6.4 PM2 Cluster Mode

Para aproveitar múltiplos cores da CPU:

```javascript
module.exports = {
  apps: [
    {
      name: `${INSTANCE}-backend`,
      script: BACKEND_FILE,
      exec_mode: "cluster",  // Modo cluster
      instances: "max",       // Usa todos os cores disponíveis
      // ou
      instances: 4,          // Número específico de instâncias
      // ... resto da config
    }
  ]
};
```

**Quando usar Cluster Mode?**:
- ✅ Alta carga de requisições
- ✅ Servidor com 4+ cores
- ❌ WebSocket (necessita sticky sessions)
- ❌ In-memory cache compartilhado

### 6.5 PM2 Ecosystem Avançado

```javascript
module.exports = {
  apps: [
    {
      name: "chatia-backend",
      script: "./dist/server.js",
      instances: 2,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",

      // Variáveis de ambiente
      env_production: {
        NODE_ENV: "production",
        PORT: 8080
      },
      env_staging: {
        NODE_ENV: "staging",
        PORT: 8081
      },

      // Logs
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",

      // Restart policy
      min_uptime: "10s",           // Tempo mínimo antes de considerar restart
      max_restarts: 10,            // Máximo de restarts em janela
      restart_delay: 4000,         // Delay entre restarts
      exp_backoff_restart_delay: 100,

      // Monitoramento
      instance_var: "INSTANCE_ID",
      merge_logs: true,

      // Cron restart (opcional)
      cron_restart: "0 3 * * *",  // Restart diário às 3h

      // Health check
      listen_timeout: 3000,
      kill_timeout: 5000
    }
  ],

  // Deploy configuration
  deploy: {
    production: {
      user: "deploy",
      host: "192.168.1.100",
      ref: "origin/main",
      repo: "git@github.com:user/chatia-flow.git",
      path: "/home/deploy/chatia",
      "post-deploy": "npm install && npm run build && pm2 reload ecosystem.config.js --env production"
    }
  }
};
```

---

## 7. DATABASE MIGRATIONS

### 7.1 Criar Nova Migration

```bash
# Gerar migration
npx sequelize-cli migration:generate --name nome-da-migration

# Exemplo: adicionar campo
npx sequelize-cli migration:generate --name add-email-to-users
```

### 7.2 Executar Migrations

```bash
# Executar todas as migrations pendentes
npm run db:migrate

# Executar migrations em produção
NODE_ENV=production npm run db:migrate

# Verificar status das migrations
npx sequelize-cli db:migrate:status
```

### 7.3 Desfazer Migrations

```bash
# Desfazer última migration
npm run db:migrate:undo

# Desfazer todas as migrations
npm run db:migrate:undo:all

# Desfazer até uma migration específica
npx sequelize-cli db:migrate:undo:all --to XXXXXXXXXXXXXX-migration-name.js
```

### 7.4 Seeds

```bash
# Executar todas as seeds
npm run db:seed

# Executar seed específica
npx sequelize-cli db:seed --seed 20230101000000-demo-user.js

# Desfazer seeds
npm run db:seed:undo:all
```

### 7.5 Backup Antes de Migrations

```bash
#!/bin/bash
# backup-before-migrate.sh

# Criar backup
pg_dump -U chatia -h localhost chatia > backup-$(date +%Y%m%d-%H%M%S).sql

# Executar migration
npm run db:migrate

# Se falhar, restaurar backup
if [ $? -ne 0 ]; then
  echo "Migration falhou! Restaurando backup..."
  psql -U chatia -h localhost chatia < backup-latest.sql
fi
```

---

## 8. BUILD PROCESS

### 8.1 Build de Produção

```bash
# Backend
cd backend
npm run build

# Isso compila TypeScript para JavaScript em /dist
```

### 8.2 Estrutura do Build

```
backend/
├── src/              # Código fonte TypeScript
│   ├── server.ts
│   ├── controllers/
│   ├── models/
│   └── services/
├── dist/             # Código compilado (gerado)
│   ├── server.js
│   ├── controllers/
│   ├── models/
│   └── services/
└── tsconfig.json
```

### 8.3 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

### 8.4 Script de Deploy Completo

```bash
#!/bin/bash
# deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment..."

# 1. Backup do banco
echo "📦 Creating database backup..."
pg_dump -U chatia chatia > backup-$(date +%Y%m%d-%H%M%S).sql

# 2. Pull do código
echo "📥 Pulling latest code..."
git pull origin main

# 3. Instalar dependências
echo "📦 Installing dependencies..."
cd backend
npm ci  # Clean install (mais rápido que npm install)

# 4. Build
echo "🔨 Building application..."
npm run build

# 5. Migrations
echo "🗄️  Running database migrations..."
npm run db:migrate

# 6. Restart PM2
echo "🔄 Restarting PM2..."
pm2 reload ecosystem.config.js --env production

# 7. Verificar saúde
echo "🏥 Health check..."
sleep 5
curl -f http://localhost:8080/health || exit 1

echo "✅ Deployment completed successfully!"
```

### 8.5 Otimização do Build

**Remover source maps em produção**:

```javascript
// webpack.config.js (se usar Webpack)
module.exports = {
  mode: 'production',
  devtool: false,  // Desabilita source maps
  // ...
};
```

**Minificar código**:

```bash
# Instalar terser
npm install -D terser

# Script de minificação
npx terser dist/server.js -o dist/server.min.js
```

---

## 9. NGINX CONFIGURATION

### 9.1 Instalação do Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# Verificar instalação
nginx -v

# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 9.2 Configuração Básica

**Arquivo**: `/etc/nginx/sites-available/chatia`

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name api.seudominio.com app.seudominio.com;

    return 301 https://$server_name$request_uri;
}

# Backend API
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.seudominio.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/api.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/chatia-backend-access.log;
    error_log /var/log/nginx/chatia-backend-error.log;

    # Max body size (para uploads)
    client_max_body_size 50M;

    # Proxy para Backend
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket Support
    location /socket.io/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # WebSocket timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Static files (se houver)
    location /public/ {
        alias /home/deploy/chatia/backend/public/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Frontend
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.seudominio.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/app.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.seudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logs
    access_log /var/log/nginx/chatia-frontend-access.log;
    error_log /var/log/nginx/chatia-frontend-error.log;

    # Proxy para Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9.3 Habilitar Configuração

```bash
# Criar symlink
sudo ln -s /etc/nginx/sites-available/chatia /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 9.4 Rate Limiting

```nginx
# No http block de /etc/nginx/nginx.conf
http {
    # Zona de limite de taxa
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    # ...
}

# No server block
server {
    location / {
        limit_req zone=api_limit burst=20 nodelay;
        # ...
    }
}
```

---

## 10. SSL/HTTPS

### 10.1 Obter Certificado (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d api.seudominio.com -d app.seudominio.com

# Renovação automática
sudo certbot renew --dry-run

# Configurar cron para renovação
sudo crontab -e
# Adicionar:
0 3 * * * certbot renew --quiet
```

### 10.2 Configuração SSL Avançada

```nginx
server {
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seudominio.com/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/api.seudominio.com/chain.pem;

    # DNS Resolver
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
}
```

---

## 11. MONITORING

### 11.1 PM2 Monitoring

```bash
# Monitor em tempo real
pm2 monit

# Logs
pm2 logs --lines 200

# Métricas
pm2 describe chatia-backend

# Plus (monitoramento web)
pm2 plus
```

### 11.2 Health Check Endpoint

**Criar endpoint de saúde** (/backend/src/routes/health.ts):

```typescript
import { Router } from "express";
import { Sequelize } from "sequelize";
import cacheLayer from "../libs/cache";

const router = Router();

router.get("/health", async (req, res) => {
  try {
    // Check database
    await Sequelize.authenticate();

    // Check Redis
    await cacheLayer.set("health:check", "ok", 10);
    const redisStatus = await cacheLayer.get("health:check");

    // Check disk space (opcional)
    const { execSync } = require("child_process");
    const diskUsage = execSync("df -h /").toString();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
      redis: redisStatus === "ok" ? "connected" : "error",
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message
    });
  }
});

export default router;
```

### 11.3 Monitoramento com UptimeRobot

1. Criar conta em uptimerobot.com
2. Adicionar monitor HTTP(S)
3. URL: https://api.seudominio.com/health
4. Intervalo: 5 minutos
5. Notificações: Email/SMS

### 11.4 Logs Centralizados

**Winston para logs**:

```typescript
// /backend/src/utils/logger.ts
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "chatia-backend" },
  transports: [
    // Arquivo de erro
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    // Arquivo combinado
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 10485760,
      maxFiles: 5
    })
  ]
});

// Console em desenvolvimento
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;
```

---

## 12. BACKUP & RECOVERY

### 12.1 Backup Automático do PostgreSQL

**Script de backup** (backup-db.sh):

```bash
#!/bin/bash

BACKUP_DIR="/home/deploy/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DB_NAME="chatia"
DB_USER="chatia"
RETENTION_DAYS=7

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup completo
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/chatia-$TIMESTAMP.sql.gz

# Remover backups antigos
find $BACKUP_DIR -name "chatia-*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: chatia-$TIMESTAMP.sql.gz"
```

**Agendar com cron**:

```bash
# Editar crontab
crontab -e

# Backup diário às 2h
0 2 * * * /home/deploy/scripts/backup-db.sh >> /home/deploy/logs/backup.log 2>&1

# Backup a cada 6 horas
0 */6 * * * /home/deploy/scripts/backup-db.sh >> /home/deploy/logs/backup.log 2>&1
```

### 12.2 Restaurar Backup

```bash
# Descompactar
gunzip chatia-20250112-020000.sql.gz

# Restaurar
psql -U chatia -h localhost chatia < chatia-20250112-020000.sql

# Ou restaurar diretamente do gzip
gunzip -c chatia-20250112-020000.sql.gz | psql -U chatia -h localhost chatia
```

### 12.3 Backup do Redis

```bash
#!/bin/bash

BACKUP_DIR="/home/deploy/backups/redis"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Forçar save do Redis
redis-cli BGSAVE

# Aguardar conclusão
sleep 5

# Copiar dump.rdb
cp /var/lib/redis/dump.rdb $BACKUP_DIR/dump-$TIMESTAMP.rdb

# Compactar
gzip $BACKUP_DIR/dump-$TIMESTAMP.rdb

echo "Redis backup completed: dump-$TIMESTAMP.rdb.gz"
```

### 12.4 Backup de Arquivos Enviados

```bash
#!/bin/bash

BACKUP_DIR="/home/deploy/backups/files"
SOURCE_DIR="/home/deploy/chatia/backend/public"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup incremental com rsync
rsync -avz --delete $SOURCE_DIR/ $BACKUP_DIR/latest/

# Snapshot diário
cp -al $BACKUP_DIR/latest $BACKUP_DIR/snapshot-$TIMESTAMP

echo "Files backup completed"
```

---

## 13. TROUBLESHOOTING

### 13.1 Backend Não Inicia

**Erro**: "Cannot connect to database"

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
pg_isready -U chatia

# Verificar credenciais no .env
cat .env | grep DB_

# Testar conexão manual
psql -U chatia -h localhost -d chatia
```

**Erro**: "Redis connection refused"

```bash
# Verificar Redis
sudo systemctl status redis
redis-cli ping

# Verificar configuração
cat .env | grep REDIS
```

**Erro**: "Port 8080 already in use"

```bash
# Ver processo usando a porta
sudo lsof -i :8080

# Matar processo
kill -9 <PID>

# Ou mudar porta no .env
```

### 13.2 PM2 Não Mantém Processo

```bash
# Ver logs de erro
pm2 logs chatia-backend --err

# Ver informações detalhadas
pm2 show chatia-backend

# Verificar memória
free -h

# Aumentar limite de memória no ecosystem.config.js
max_memory_restart: "2G"
```

### 13.3 Nginx 502 Bad Gateway

```bash
# Verificar se backend está rodando
pm2 list

# Verificar porta
netstat -tulpn | grep 8080

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Testar backend diretamente
curl http://localhost:8080/health
```

### 13.4 Migrations Falham

```bash
# Verificar status
npx sequelize-cli db:migrate:status

# Ver última migration executada
psql -U chatia -c "SELECT * FROM SequelizeMeta ORDER BY name DESC LIMIT 1;"

# Forçar undo e refazer
npm run db:migrate:undo
npm run db:migrate
```

---

**Documentação gerada**: Janeiro 2025
**Versão**: 1.0
**Última atualização**: 12/01/2025
