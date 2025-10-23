FROM node:16-alpine

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    git \
    ffmpeg \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer para usar o Chromium instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Criar diretório para uploads e sessões
RUN mkdir -p public uploads

# Expor porta
EXPOSE 3000

# Comando para rodar migrations e iniciar aplicação
CMD ["sh", "-c", "npm run db:migrate && npm start"]
