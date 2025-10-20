/**
 * MOD-6: ConfigGenerator
 *
 * Responsabilidade: Gerar arquivos .env para backend e frontend + nginx.conf
 *
 * Features:
 * - Geração de JWT secrets aleatórios (base64, 32 bytes)
 * - Templates de .env com todas as variáveis necessárias
 * - Configuração Nginx com proxy reverso
 * - Substituição de placeholders
 */

import crypto from 'crypto';

class ConfigGenerator {
  constructor(logCallback = console.log) {
    this.log = logCallback;
  }

  /**
   * Gera conteúdo do .env do backend
   * @param {Object} config - Configuração da instalação
   */
  generateBackendEnv(config) {
    return `NODE_ENV=production
BACKEND_URL=${config.backendUrl}
FRONTEND_URL=${config.frontendUrl}
PROXY_PORT=443
PORT=${config.backendPort}

DB_HOST=${config.db.host}
DB_DIALECT=postgres
DB_PORT=${config.db.port}
DB_USER=${config.db.user}
DB_PASS=${config.db.password}
DB_NAME=${config.db.database}

REDIS_URI=redis://:${config.redis.password}@${config.redis.host}:${config.redis.port}
REDIS_OPT_LIMITER_MAX=1
REDIS_OPT_LIMITER_DURATION=3000
TIMEOUT_TO_IMPORT_MESSAGE=1000
FFMPEG_PATH=/usr/bin/ffmpeg
JWT_SECRET=${this.generateRandomSecret(32)}
JWT_REFRESH_SECRET=${this.generateRandomSecret(32)}
MASTER_KEY=${config.masterKey || '123456'}
VERIFY_TOKEN=whaticket
FACEBOOK_APP_ID=${config.facebookAppId || ''}
FACEBOOK_APP_SECRET=${config.facebookAppSecret || ''}
USE_WHATSAPP_OFICIAL=true
TOKEN_API_OFICIAL=adminpro
TRANSCRIBE_URL=http://localhost:4002`;
  }

  /**
   * Gera conteúdo do .env do frontend
   * @param {Object} config - Configuração da instalação
   */
  generateFrontendEnv(config) {
    return `REACT_APP_BACKEND_URL=${config.backendUrl}
REACT_APP_FACEBOOK_APP_ID=${config.facebookAppId || ''}
REACT_APP_REQUIRE_BUSINESS_MANAGEMENT=TRUE
REACT_APP_NAME_SYSTEM=${config.companyName || config.companySlug}
REACT_APP_NUMBER_SUPPORT=${config.supportPhone || '553191505564'}
SERVER_PORT=${config.frontendPort}`;
  }

  /**
   * Gera string aleatória base64 para JWT secrets
   * @param {number} length - Número de bytes
   */
  generateRandomSecret(length) {
    return crypto.randomBytes(length).toString('base64');
  }

  /**
   * Gera configuração do Nginx
   * @param {Object} config - Configuração da instalação
   */
  generateNginxConfig(config) {
    return `server {
    listen 80;
    server_name ${config.frontendDomain};

    root /home/deploy/${config.companySlug}/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 80;
    server_name ${config.backendDomain};

    location / {
        proxy_pass http://localhost:${config.backendPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}`;
  }

  /**
   * Calcula portas baseado em hash do nome da empresa
   * @param {string} companySlug - Nome da empresa
   */
  calculatePorts(companySlug) {
    // Hash simples para gerar portas determinísticas mas únicas
    const hash = crypto.createHash('md5').update(companySlug).digest('hex');
    const basePort = 8000 + (parseInt(hash.substring(0, 4), 16) % 1000);

    return {
      backendPort: basePort,
      frontendPort: basePort + 1000
    };
  }

  /**
   * Normaliza nome de empresa para slug
   * @param {string} companyName - Nome da empresa
   */
  normalizeCompanySlug(companyName) {
    return companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-')     // Substitui caracteres especiais por -
      .replace(/^-+|-+$/g, '');         // Remove - do início e fim
  }
}

export default ConfigGenerator;
