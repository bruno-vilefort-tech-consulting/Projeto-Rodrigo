# ChatIA Instalador GUI

Instalador visual com tema dark para ChatIA Flow v5. Substitui o script shell por um bootstrapper com UI, download paralelo, validação SHA-256 e extração streaming de artefatos pré-construídos do CI/CD.

## 🚀 Arquitetura

### Pipeline (GitHub Actions)
Constrói e versiona artefatos:
- `backend_dist.tar.gz` - Backend compilado (TypeScript → JavaScript)
- `backend_node_modules.tar.gz` - Dependências do backend
- `frontend_build.tar.gz` - Frontend buildado (React production)
- `manifest.json` - Manifesto com URLs e checksums SHA-256

### Instalador Tauri
- **UI:** React 18 + TypeScript com tema dark
- **Backend:** Rust com download paralelo (buffer_unordered)
- **Validação:** SHA-256 checksum streaming
- **Extração:** tar.gz com stripComponents
- **Config:** Geração automática de `.env` backend/frontend
- **Pós-instalação:** Script opcional `postinstall.sh` (PM2, Redis, PostgreSQL)

## 📋 Pré-requisitos

### Sistema
- **Linux:** Ubuntu 22.04+ ou Debian 11+
- **Node.js:** 20.x+
- **Rust:** 1.70+ (para build do Tauri)
- **Sistema:** `webkit2gtk-4.1`, `libssl3`

### Instalação de Dependências (Ubuntu/Debian)

```bash
# Instalar dependências do sistema
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar versões
node --version   # v20.x.x
npm --version    # 10.x.x
rustc --version  # 1.70+
```

## 🛠️ Desenvolvimento

### 1. Instalar Dependências

```bash
cd @instalador
npm install
```

### 2. Modo Desenvolvimento

```bash
# Iniciar em modo dev (hot reload)
npm run tauri:dev
```

A aplicação abrirá automaticamente com hot reload para React e Rust.

### 3. Build de Produção

```bash
# Build completo (gera .deb e AppImage)
npm run tauri:build

# Apenas para Linux x86_64
npm run tauri:build:linux
```

**Artefatos gerados em:**
- `src/src-tauri/target/release/bundle/deb/chatia-installer_*.deb`
- `src/src-tauri/target/release/bundle/appimage/chatia-installer_*.AppImage`

## 📦 Uso do Instalador

### 1. Preparar Artefatos no GitHub

O workflow `.github/workflows/build-artifacts.yml` gera automaticamente os artefatos quando você cria uma tag:

```bash
# Criar tag de release
git tag v5.0.0
git push origin v5.0.0
```

O GitHub Actions irá:
1. Buildar backend e frontend
2. Criar arquivos `.tar.gz`
3. Gerar checksums SHA-256
4. Criar `manifest.json` com URLs e hashes
5. Fazer upload no GitHub Release

### 2. Executar o Instalador

```bash
# Via .deb
sudo dpkg -i chatia-installer_*.deb
chatia-installer

# Via AppImage
chmod +x chatia-installer_*.AppImage
./chatia-installer_*.AppImage
```

### 3. Preencher Formulário

**Campos obrigatórios:**
- **URL do Manifest:** `https://github.com/USER/REPO/releases/download/v5.0.0/manifest.json`
- **Backend URL:** `https://api.exemplo.com`
- **Frontend URL:** `https://app.exemplo.com`
- **Email (admin):** `admin@empresa.com`
- **Nome da Empresa:** `Minha Empresa` (será normalizado para slug)
- **Senha Deploy/Redis/DB:** Senha única para deploy, Redis e PostgreSQL
- **Senha MASTER:** Senha do painel administrativo
- **Telefone Suporte:** `5511999999999` (apenas números)

**Campos opcionais:**
- **FACEBOOK_APP_ID**
- **FACEBOOK_APP_SECRET**
- **Backup SQL:** Caminho para arquivo `.sql` (será copiado)
- **Executar pós-instalação:** Marcar para rodar `postinstall.sh` (requer sudo)

### 4. Processo de Instalação

O instalador executa as seguintes etapas:

1. **Download:** Baixa artefatos em paralelo (3 simultâneos)
2. **Verificação:** Valida SHA-256 de cada arquivo
3. **Extração:** Descompacta para `/home/deploy/{empresa}/`
4. **Config:** Gera `.env` para backend e frontend
5. **Backup:** Copia backup SQL (se fornecido)
6. **Pós-instalação:** Executa `postinstall.sh` (se marcado)

**Barra de progresso mostra:**
- Fase atual (download, verify, extract, write-env, postinstall)
- Artefato sendo processado
- Progresso em MB (para downloads)
- Logs detalhados (colapsáveis)

## 🔧 Pós-Instalação (postinstall.sh)

O script `postinstall.sh` é executado com `sudo` e faz:

1. **Usuário deploy:** Cria usuário `deploy` com permissões
2. **PM2:** Instala Node.js 20 e PM2 globalmente
3. **Redis/PostgreSQL:** Instala e habilita serviços
4. **Database:** Cria role e database PostgreSQL (idempotente)
5. **Permissões:** Ajusta ownership para usuário `deploy`
6. **Start Apps:** Sobe backend e frontend com PM2

**Variáveis de ambiente usadas:**
- `EMPRESA` - Nome da empresa (slug)
- `DEPLOY_PASS` - Senha do PostgreSQL/Redis

## 📁 Estrutura do Projeto

```
@instalador/
├── src/
│   ├── main.tsx              # Entry point React
│   ├── app.tsx               # Componente principal (UI dark)
│   ├── app.css               # Estilos tema dark
│   └── src-tauri/
│       ├── src/
│       │   └── main.rs       # Backend Rust (download, SHA-256, extração)
│       ├── Cargo.toml        # Dependências Rust
│       └── tauri.conf.json   # Configuração Tauri v2
├── index.html                # Entry point HTML
├── package.json              # Dependências Node.js
├── tsconfig.json             # Configuração TypeScript
├── vite.config.ts            # Configuração Vite
├── manifest.json             # Exemplo de manifesto
├── postinstall.sh            # Script de pós-instalação
└── README.md                 # Este arquivo
```

## 🎨 Features

### UI
- ✅ Tema dark com cores consistentes
- ✅ Validação inline de email e telefone
- ✅ Barra de progresso animada
- ✅ Logs colapsáveis com scroll
- ✅ Estados visuais (idle, loading, success, error)
- ✅ Spinner animado durante instalação

### Backend Rust
- ✅ Download paralelo com `buffer_unordered(3)`
- ✅ Validação SHA-256 streaming (128KB buffer)
- ✅ Extração tar.gz com `stripComponents`
- ✅ Normalização de nome de empresa para slug
- ✅ Geração de JWT secrets aleatórios (base64)
- ✅ Cálculo de portas baseado em hash do nome
- ✅ Substituição de `__EMPRESA__` nos paths
- ✅ Execução de `postinstall.sh` via sudo

### Segurança
- ✅ Checksums SHA-256 obrigatórios
- ✅ Validação de email/telefone com regex
- ✅ HTTPS forçado para backend/frontend URLs
- ✅ Secrets gerados com `rand::OsRng`

## 🐛 Troubleshooting

### Erro: "Checksum inválido"
- Verifique se o `manifest.json` foi gerado pelo CI
- Confirme que os arquivos `.tar.gz` não foram modificados
- Re-faça download dos artefatos

### Erro: "postinstall.sh não encontrado"
- Certifique-se de que `postinstall.sh` está no diretório do manifesto
- Ou desmarque a opção "Executar pós-instalação"

### Erro: "Permissão negada"
- Execute o instalador com privilégios de escrita em `/home/deploy/`
- Para `postinstall.sh`, você precisará de `sudo`

### Instalador não abre
```bash
# Instalar dependências faltantes
sudo apt install libwebkit2gtk-4.1-0 libssl3

# Verificar logs
journalctl -xe | grep chatia
```

## 🔄 Atualização

Para atualizar o ChatIA para uma nova versão:

1. Crie nova tag no GitHub: `git tag v5.1.0 && git push origin v5.1.0`
2. Aguarde o CI gerar os artefatos
3. Execute o instalador novamente apontando para o novo manifest
4. O instalador sobrescreverá os arquivos existentes

## 📝 Notas

- **Ganho de velocidade:** 40-70% mais rápido que o script shell original
- **Idempotência:** `postinstall.sh` pode ser executado múltiplas vezes
- **Multi-tenant:** Cada empresa tem seu próprio diretório isolado
- **Portas dinâmicas:** Backend e frontend usam portas calculadas por hash

## 📄 Licença

MIT License - ChatIA Team © 2025
