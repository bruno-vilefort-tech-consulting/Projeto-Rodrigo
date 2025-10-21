#!/usr/bin/env bash
#===============================================================================
# ChatIA Flow - Modern Installer Script v6.0
# Ultra-optimized with GitHub Actions artifacts support
# Requirements: Ubuntu 20.04+ / Debian 11+
#===============================================================================

set -euo pipefail
trap 'error_handler $? $LINENO' ERR

#=========================== CONFIGURATION =====================================

# Colors and formatting
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly MAGENTA='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly DIM='\033[2m'
readonly NC='\033[0m' # No Color

# GitHub Release Configuration
readonly GITHUB_REPO="${GITHUB_REPO:-bruno-vilefort-tech-consulting/Projeto-Rodrigo}"
readonly GITHUB_TAG="${GITHUB_TAG:-v5.0.0}"
readonly GITHUB_TOKEN="${GITHUB_TOKEN:-}"
readonly MANIFEST_URL="https://github.com/${GITHUB_REPO}/releases/download/${GITHUB_TAG}/manifest.json"

# Installation paths
readonly BASE_DIR="/home/deploy"
readonly LOG_DIR="/var/log/chatia"
readonly LOG_FILE="${LOG_DIR}/install-$(date +%Y%m%d-%H%M%S).log"
readonly CONFIG_FILE="/etc/chatia/config.env"
readonly STATE_FILE="/etc/chatia/install.state"

# System requirements
readonly MIN_RAM=2048  # MB
readonly MIN_DISK=10   # GB
readonly MIN_CPU=2

# Default ports
readonly DEFAULT_BACKEND_PORT=8080
readonly DEFAULT_FRONTEND_PORT=3000

#=========================== UTILITY FUNCTIONS =================================

# Logging with timestamps and levels
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local color=""

    case "$level" in
        INFO)  color="$CYAN" ;;
        SUCCESS) color="$GREEN" ;;
        WARN)  color="$YELLOW" ;;
        ERROR) color="$RED" ;;
        DEBUG) color="$DIM" ;;
    esac

    echo -e "${color}[${timestamp}] [${level}] ${message}${NC}" | tee -a "$LOG_FILE"
}

# Error handler with stack trace
error_handler() {
    local exit_code=$1
    local line_no=$2
    log ERROR "Error occurred in script at line ${line_no} with exit code ${exit_code}"
    log ERROR "Call stack:"
    local frame=0
    while caller $frame; do
        ((frame++))
    done
    cleanup_on_error
    exit $exit_code
}

# Cleanup on error
cleanup_on_error() {
    log WARN "Performing cleanup..."
    if [[ -f "$STATE_FILE" ]]; then
        echo "ERROR" >> "$STATE_FILE"
    fi
}

# Progress bar
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percent=$((current * 100 / total))
    local completed=$((width * current / total))

    printf "\r["
    printf "%${completed}s" | tr ' ' '='
    printf "%$((width - completed))s" | tr ' ' '-'
    printf "] %3d%% (%d/%d)" $percent $current $total

    if [[ $current -eq $total ]]; then
        echo
    fi
}

# Check command availability
check_command() {
    local cmd=$1
    if ! command -v "$cmd" &> /dev/null; then
        log ERROR "Required command '$cmd' not found"
        return 1
    fi
}

# Validate URL
validate_url() {
    local url=$1
    if [[ ! "$url" =~ ^https?:// ]]; then
        return 1
    fi
    return 0
}

# Validate email
validate_email() {
    local email=$1
    if [[ ! "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 1
    fi
    return 0
}

# Save state for recovery
save_state() {
    local key=$1
    local value=$2
    mkdir -p "$(dirname "$STATE_FILE")"
    echo "${key}=${value}" >> "$STATE_FILE"
}

# Load state
load_state() {
    if [[ -f "$STATE_FILE" ]]; then
        source "$STATE_FILE"
    fi
}

#=========================== SYSTEM CHECKS =====================================

check_system_requirements() {
    log INFO "Checking system requirements..."

    # Check OS
    if [[ ! -f /etc/os-release ]]; then
        log ERROR "Cannot determine OS version"
        return 1
    fi

    source /etc/os-release
    log INFO "Detected OS: $PRETTY_NAME"

    # Check RAM
    local total_ram=$(free -m | awk '/^Mem:/{print $2}')
    if [[ $total_ram -lt $MIN_RAM ]]; then
        log ERROR "Insufficient RAM: ${total_ram}MB (minimum: ${MIN_RAM}MB)"
        return 1
    fi
    log SUCCESS "RAM: ${total_ram}MB ✓"

    # Check disk space
    local available_disk=$(df / | awk 'NR==2 {print int($4/1048576)}')
    if [[ $available_disk -lt $MIN_DISK ]]; then
        log ERROR "Insufficient disk space: ${available_disk}GB (minimum: ${MIN_DISK}GB)"
        return 1
    fi
    log SUCCESS "Disk: ${available_disk}GB available ✓"

    # Check CPU cores
    local cpu_cores=$(nproc)
    if [[ $cpu_cores -lt $MIN_CPU ]]; then
        log WARN "Low CPU cores: ${cpu_cores} (recommended: ${MIN_CPU})"
    else
        log SUCCESS "CPU: ${cpu_cores} cores ✓"
    fi

    # Check network
    if ! ping -c 1 -W 2 8.8.8.8 &> /dev/null; then
        log ERROR "No internet connection"
        return 1
    fi
    log SUCCESS "Network connectivity ✓"

    return 0
}

#=========================== DNS VALIDATION ====================================

validate_dns() {
    local domain=$1
    local expected_ip=$2

    log INFO "Validating DNS for ${domain}..."

    # Get domain IP
    local resolved_ip=$(dig +short "$domain" | head -n1)

    if [[ -z "$resolved_ip" ]]; then
        log ERROR "Failed to resolve ${domain}"
        return 1
    fi

    if [[ "$resolved_ip" != "$expected_ip" ]]; then
        log ERROR "DNS mismatch for ${domain}: resolved to ${resolved_ip}, expected ${expected_ip}"
        return 1
    fi

    log SUCCESS "DNS validated for ${domain} → ${resolved_ip} ✓"
    return 0
}

get_public_ip() {
    local ip=""
    local services=("https://api.ipify.org" "https://ifconfig.me" "https://icanhazip.com")

    for service in "${services[@]}"; do
        if ip=$(curl -s --max-time 5 "$service"); then
            if [[ "$ip" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                echo "$ip"
                return 0
            fi
        fi
    done

    return 1
}

#=========================== DOWNLOAD FUNCTIONS ================================

download_with_progress() {
    local url=$1
    local output=$2
    local description=$3

    log INFO "Downloading ${description}..."

    # Use GitHub token if available
    local curl_opts=(-L -f --progress-bar)
    if [[ -n "$GITHUB_TOKEN" ]]; then
        curl_opts+=(-H "Authorization: token ${GITHUB_TOKEN}")
    fi

    if ! curl "${curl_opts[@]}" "$url" -o "$output"; then
        log ERROR "Failed to download ${description}"
        return 1
    fi

    log SUCCESS "Downloaded ${description} ✓"
    return 0
}

verify_checksum() {
    local file=$1
    local expected=$2

    log INFO "Verifying checksum for $(basename "$file")..."

    local actual=$(sha256sum "$file" | cut -d' ' -f1)
    if [[ "$actual" != "$expected" ]]; then
        log ERROR "Checksum mismatch!"
        log ERROR "Expected: $expected"
        log ERROR "Actual: $actual"
        return 1
    fi

    log SUCCESS "Checksum verified ✓"
    return 0
}

#=========================== INSTALLATION FUNCTIONS ============================

install_dependencies() {
    log INFO "Installing system dependencies..."

    # Update package list
    apt-get update -qq

    # Fix any broken packages first
    apt-get install -f -y || true
    dpkg --configure -a || true

    # Install dependencies in stages to handle errors better

    # Stage 1: Basic tools
    log INFO "Installing basic tools..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        curl wget git software-properties-common build-essential || {
        log ERROR "Failed to install basic tools"
        return 1
    }

    # Stage 2: Database
    log INFO "Installing PostgreSQL and Redis..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        postgresql postgresql-contrib redis-server || {
        log ERROR "Failed to install databases"
        return 1
    }

    # Stage 3: Create nginx.conf if it doesn't exist
    if [[ ! -f /etc/nginx/nginx.conf ]]; then
        log INFO "Creating default nginx.conf..."
        mkdir -p /etc/nginx
        cat > /etc/nginx/nginx.conf <<'NGINX_CONF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    types_hash_max_size 2048;
    server_tokens off;

    server_names_hash_bucket_size 64;
    server_name_in_redirect off;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
    ssl_prefer_server_ciphers off;

    # Logging Settings
    access_log /var/log/nginx/access.log;

    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml application/atom+xml image/svg+xml text/x-js text/x-cross-domain-policy application/x-font-ttf application/x-font-opentype application/vnd.ms-fontobject image/x-icon;

    # Virtual Host Configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
NGINX_CONF
    fi

    # Create necessary nginx directories
    mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled /etc/nginx/conf.d
    mkdir -p /var/log/nginx

    # Stage 4: Nginx
    log INFO "Installing Nginx..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y nginx || {
        log WARN "Nginx installation had issues, trying to fix..."

        # Try to fix nginx installation
        systemctl stop nginx 2>/dev/null || true
        apt-get remove -y nginx nginx-common nginx-core 2>/dev/null || true
        apt-get autoremove -y 2>/dev/null || true
        apt-get install -y nginx || {
            log ERROR "Failed to install nginx after retry"
            return 1
        }
    }

    # Stage 5: Certbot (optional, don't fail if it doesn't install)
    log INFO "Installing Certbot..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-nginx || {
        log WARN "Certbot installation failed, SSL setup will be skipped"
    }

    # Stage 6: Additional tools
    log INFO "Installing additional tools..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y ufw fail2ban htop || {
        log WARN "Some additional tools failed to install, continuing..."
    }

    # Install Node.js 20
    if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | sed 's/v//') -lt 20 ]]; then
        log INFO "Installing Node.js 20..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi

    # Install PM2 globally
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
        log SUCCESS "PM2 installed ✓"
    else
        log INFO "PM2 already installed"
    fi

    # Install pnpm
    if ! command -v pnpm &> /dev/null; then
        npm install -g pnpm
        log SUCCESS "pnpm installed ✓"
    else
        log INFO "pnpm already installed"
    fi

    log SUCCESS "Dependencies installed ✓"
}

setup_user() {
    local company=$1

    log INFO "Setting up deploy user..."

    if ! id deploy &>/dev/null; then
        useradd -m -s /bin/bash deploy
        usermod -aG sudo deploy
        echo "deploy ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/deploy_nopasswd
    fi

    # Create directories
    mkdir -p "${BASE_DIR}/${company}"/{backend,frontend}
    mkdir -p "$LOG_DIR"
    mkdir -p /etc/chatia

    # Set permissions
    chown -R deploy:deploy "${BASE_DIR}/${company}"
    chown -R deploy:deploy "$LOG_DIR"

    log SUCCESS "User setup complete ✓"
}

setup_database() {
    local company=$1
    local password=$2

    log INFO "Setting up PostgreSQL database..."

    # Start PostgreSQL
    systemctl enable --now postgresql

    # Create role and database
    sudo -u postgres psql <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${company}') THEN
        CREATE ROLE ${company} LOGIN PASSWORD '${password}';
    END IF;
END
\$\$;

DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${company}') THEN
        CREATE DATABASE ${company} OWNER ${company};
    END IF;
END
\$\$;

GRANT ALL PRIVILEGES ON DATABASE ${company} TO ${company};
EOF

    log SUCCESS "Database setup complete ✓"
}

check_release_exists() {
    log INFO "Checking if release exists..."

    # Try to get release info
    local release_api_url="https://api.github.com/repos/${GITHUB_REPO}/releases/tags/${GITHUB_TAG}"
    local curl_opts=(-s -f)

    if [[ -n "$GITHUB_TOKEN" ]]; then
        curl_opts+=(-H "Authorization: token ${GITHUB_TOKEN}")
    fi

    if curl "${curl_opts[@]}" "$release_api_url" > /dev/null 2>&1; then
        log SUCCESS "Release ${GITHUB_TAG} found ✓"
        return 0
    else
        log ERROR "Release ${GITHUB_TAG} not found in ${GITHUB_REPO}"
        log ERROR "Please check:"
        log ERROR "  1. The release exists at: https://github.com/${GITHUB_REPO}/releases/tag/${GITHUB_TAG}"
        log ERROR "  2. The GitHub Actions workflow has completed successfully"
        log ERROR "  3. The manifest.json file was uploaded to the release"
        return 1
    fi
}

build_from_source() {
    local company=$1

    log INFO "Building from source code..."

    # Backend build
    if [[ -d "backend" ]]; then
        log INFO "Building backend..."
        cd backend

        # Install dependencies
        if [[ -f "pnpm-lock.yaml" ]]; then
            pnpm install --frozen-lockfile
        elif [[ -f "package-lock.json" ]]; then
            npm ci
        else
            npm install
        fi

        # Build TypeScript
        npm run build

        # Copy to deployment directory
        cp -r dist/* "${BASE_DIR}/${company}/backend/"
        cp -r node_modules "${BASE_DIR}/${company}/backend/"
        cp package.json "${BASE_DIR}/${company}/backend/"

        # Copy migrations if exist
        if [[ -d "src/database" ]]; then
            cp -r src/database "${BASE_DIR}/${company}/backend/"
        fi

        cd ..
        log SUCCESS "Backend built ✓"
    fi

    # Frontend build
    if [[ -d "frontend" ]]; then
        log INFO "Building frontend..."
        cd frontend

        # Install dependencies
        if [[ -f "pnpm-lock.yaml" ]]; then
            pnpm install --shamefully-hoist
        elif [[ -f "package-lock.json" ]]; then
            npm ci
        else
            npm install
        fi

        # Build
        export NODE_OPTIONS="--max-old-space-size=4096"
        export CI=false
        npm run build

        # Copy to deployment directory
        cp -r build/* "${BASE_DIR}/${company}/frontend/"

        # Copy server files if exist
        if [[ -f "server.js" ]]; then
            cp server.js "${BASE_DIR}/${company}/frontend/"
        fi
        cp package.json "${BASE_DIR}/${company}/frontend/"

        cd ..
        log SUCCESS "Frontend built ✓"
    fi

    log SUCCESS "Build from source completed ✓"
}

download_artifacts() {
    local company=$1
    local manifest_file="/tmp/manifest.json"

    # Check if release exists first
    if ! check_release_exists; then
        log ERROR "Cannot proceed without a valid release"
        log INFO "You can:"
        log INFO "  1. Wait for GitHub Actions to complete the build"
        log INFO "  2. Check the Actions status at: https://github.com/${GITHUB_REPO}/actions"
        log INFO "  3. Manually trigger the workflow if needed"
        return 1
    fi

    log INFO "Downloading release manifest..."

    # Download manifest
    if ! download_with_progress "$MANIFEST_URL" "$manifest_file" "manifest.json"; then
        log ERROR "Failed to download manifest.json"
        log ERROR "The release may not have artifacts yet. Check:"
        log ERROR "  https://github.com/${GITHUB_REPO}/releases/tag/${GITHUB_TAG}"
        return 1
    fi

    # Parse manifest and download artifacts
    local artifacts=$(jq -r '.artifacts[] | @json' "$manifest_file")
    local total=$(echo "$artifacts" | wc -l)
    local current=0

    while IFS= read -r artifact_json; do
        ((current++))
        local artifact=$(echo "$artifact_json" | jq -r '.')
        local name=$(echo "$artifact" | jq -r '.name')
        local url=$(echo "$artifact" | jq -r '.url')
        local sha256=$(echo "$artifact" | jq -r '.sha256')
        local targetDir=$(echo "$artifact" | jq -r '.targetDir' | sed "s/__EMPRESA__/${company}/g")
        local stripComponents=$(echo "$artifact" | jq -r '.stripComponents // 1')

        log INFO "Downloading artifact ${current}/${total}: ${name}"
        show_progress $current $total

        local temp_file="/tmp/${name}.tar.gz"

        # Download artifact
        if ! download_with_progress "$url" "$temp_file" "$name"; then
            return 1
        fi

        # Verify checksum
        if ! verify_checksum "$temp_file" "$sha256"; then
            rm -f "$temp_file"
            return 1
        fi

        # Extract artifact
        log INFO "Extracting ${name} to ${targetDir}..."
        mkdir -p "$targetDir"

        if [[ "$stripComponents" -eq 0 ]]; then
            tar -xzf "$temp_file" -C "$targetDir"
        else
            tar -xzf "$temp_file" -C "$targetDir" --strip-components="$stripComponents"
        fi

        rm -f "$temp_file"
        log SUCCESS "Extracted ${name} ✓"
    done <<< "$artifacts"

    rm -f "$manifest_file"
    log SUCCESS "All artifacts downloaded and extracted ✓"
}

configure_environment() {
    local company=$1
    local backend_url=$2
    local frontend_url=$3
    local email=$4
    local deploy_pass=$5
    local master_pass=$6
    local phone=$7
    local fb_app_id=${8:-}
    local fb_app_secret=${9:-}

    log INFO "Configuring environment variables..."

    # Extract hostnames from URLs
    local backend_host=$(echo "$backend_url" | sed 's|https\?://||' | sed 's|/.*||')
    local frontend_host=$(echo "$frontend_url" | sed 's|https\?://||' | sed 's|/.*||')

    # Backend .env
    cat > "${BASE_DIR}/${company}/backend/.env" <<EOF
# Database
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${company}
DB_USER=${company}
DB_PASS=${deploy_pass}

# Redis
REDIS_URI_ACK=redis://:${deploy_pass}@localhost:6379/1
REDIS_URI_MSG_CONN=redis://:${deploy_pass}@localhost:6379/2
REDIS_OPT_LIMITER_MAX=1
REDIS_OPT_LIMITER_DURATION=3000

# Server
PORT=${DEFAULT_BACKEND_PORT}
HOST=0.0.0.0
FRONTEND_URL=https://${frontend_host}
BACKEND_URL=https://${backend_host}

# JWT
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# Admin
ADMIN_EMAIL=${email}
ADMIN_PASSWORD=${master_pass}
COMPANY_NAME=${company}
SUPPORT_PHONE=${phone}

# Facebook (optional)
FACEBOOK_APP_ID=${fb_app_id}
FACEBOOK_APP_SECRET=${fb_app_secret}

# Socket.IO
SOCKET_ADMIN=true
SOCKET_ADMIN_USERNAME=admin
SOCKET_ADMIN_PASSWORD=${master_pass}

# Bull Queue
BULL_BOARD=true
BULL_USER=admin
BULL_PASSWORD=${master_pass}

# Environment
NODE_ENV=production
TZ=America/Sao_Paulo
EOF

    # Frontend .env
    cat > "${BASE_DIR}/${company}/frontend/.env" <<EOF
REACT_APP_BACKEND_URL=https://${backend_host}
REACT_APP_COMPANY_NAME=${company}
PORT=${DEFAULT_FRONTEND_PORT}
NODE_ENV=production
EOF

    # Set permissions
    chown deploy:deploy "${BASE_DIR}/${company}/backend/.env"
    chown deploy:deploy "${BASE_DIR}/${company}/frontend/.env"
    chmod 600 "${BASE_DIR}/${company}/backend/.env"
    chmod 600 "${BASE_DIR}/${company}/frontend/.env"

    # Save global config
    cat > "$CONFIG_FILE" <<EOF
COMPANY=${company}
BACKEND_HOST=${backend_host}
FRONTEND_HOST=${frontend_host}
BACKEND_PORT=${DEFAULT_BACKEND_PORT}
FRONTEND_PORT=${DEFAULT_FRONTEND_PORT}
ADMIN_EMAIL=${email}
DEPLOY_PASS=${deploy_pass}
EOF

    log SUCCESS "Environment configured ✓"
}

run_migrations() {
    local company=$1

    log INFO "Running database migrations..."

    local backend_dir="${BASE_DIR}/${company}/backend"

    if [[ ! -d "$backend_dir" ]]; then
        log ERROR "Backend directory not found: $backend_dir"
        return 1
    fi

    cd "$backend_dir"

    # Copy .sequelizerc if it was included in the artifact
    if [[ -f ".sequelizerc.deploy" ]]; then
        cp .sequelizerc.deploy .sequelizerc
    fi

    # Check if sequelize-cli is available
    if ! npx sequelize --version &>/dev/null; then
        log INFO "Installing sequelize-cli..."
        npm install --save-dev sequelize-cli
    fi

    # Run migrations
    if sudo -u deploy npx sequelize db:migrate; then
        log SUCCESS "Migrations completed ✓"
    else
        log WARN "Migrations failed or already applied"
        log INFO "You can run migrations manually later with:"
        log INFO "  cd ${backend_dir}"
        log INFO "  npx sequelize db:migrate"
    fi

    cd - >/dev/null
}

setup_pm2_services() {
    local company=$1

    log INFO "Setting up PM2 services..."

    # Backend service
    sudo -u deploy pm2 start "${BASE_DIR}/${company}/backend/dist/server.js" \
        --name "${company}-backend" \
        --cwd "${BASE_DIR}/${company}/backend" \
        -i 2 \
        --merge-logs \
        --log "${LOG_DIR}/${company}-backend.log"

    # Frontend service
    sudo -u deploy pm2 start "${BASE_DIR}/${company}/frontend/build/server.js" \
        --name "${company}-frontend" \
        --cwd "${BASE_DIR}/${company}/frontend/build" \
        --merge-logs \
        --log "${LOG_DIR}/${company}-frontend.log"

    # Save PM2 configuration
    sudo -u deploy pm2 save

    # Setup PM2 startup
    pm2 startup systemd -u deploy --hp /home/deploy

    log SUCCESS "PM2 services configured ✓"
}

setup_nginx() {
    local company=$1
    local backend_host=$2
    local frontend_host=$3

    log INFO "Configuring Nginx..."

    # Ensure nginx is stopped while we configure
    systemctl stop nginx 2>/dev/null || true

    # Create directories if they don't exist
    mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

    # Remove default site if exists
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

    # Backend configuration
    cat > "/etc/nginx/sites-available/${company}-backend" <<EOF
upstream ${company}_backend {
    server 127.0.0.1:${DEFAULT_BACKEND_PORT} max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name ${backend_host};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log ${LOG_DIR}/${company}-backend-access.log;
    error_log ${LOG_DIR}/${company}-backend-error.log;

    location / {
        proxy_pass http://${company}_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffers
        proxy_buffering off;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;

        # WebSocket support
        proxy_set_header Sec-WebSocket-Extensions \$http_sec_websocket_extensions;
        proxy_set_header Sec-WebSocket-Key \$http_sec_websocket_key;
        proxy_set_header Sec-WebSocket-Version \$http_sec_websocket_version;
    }
}
EOF

    # Frontend configuration
    cat > "/etc/nginx/sites-available/${company}-frontend" <<EOF
upstream ${company}_frontend {
    server 127.0.0.1:${DEFAULT_FRONTEND_PORT} max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name ${frontend_host};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log ${LOG_DIR}/${company}-frontend-access.log;
    error_log ${LOG_DIR}/${company}-frontend-error.log;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    location / {
        proxy_pass http://${company}_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://${company}_frontend;
            proxy_cache_valid 200 302 60m;
            proxy_cache_valid 404 1m;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

    # Enable sites
    ln -sf "/etc/nginx/sites-available/${company}-backend" "/etc/nginx/sites-enabled/"
    ln -sf "/etc/nginx/sites-available/${company}-frontend" "/etc/nginx/sites-enabled/"

    # Test configuration
    if nginx -t 2>/dev/null; then
        log SUCCESS "Nginx configuration valid ✓"

        # Start or restart nginx
        if systemctl is-active nginx >/dev/null 2>&1; then
            systemctl reload nginx
            log SUCCESS "Nginx reloaded ✓"
        else
            systemctl start nginx
            log SUCCESS "Nginx started ✓"
        fi

        # Enable nginx to start on boot
        systemctl enable nginx 2>/dev/null || true
    else
        log ERROR "Nginx configuration test failed"
        nginx -t 2>&1 | while read line; do
            log ERROR "  $line"
        done
        log WARN "Nginx configuration has errors. You may need to fix them manually."
        log WARN "Check: /etc/nginx/sites-available/${company}-backend"
        log WARN "Check: /etc/nginx/sites-available/${company}-frontend"
        return 1
    fi
}

setup_ssl() {
    local backend_host=$1
    local frontend_host=$2
    local email=$3

    log INFO "Setting up SSL certificates..."

    # Check if domains are accessible
    if ! curl -f -s "http://${backend_host}" > /dev/null; then
        log WARN "Backend not accessible via HTTP, skipping SSL for now"
        return 0
    fi

    if ! curl -f -s "http://${frontend_host}" > /dev/null; then
        log WARN "Frontend not accessible via HTTP, skipping SSL for now"
        return 0
    fi

    # Request certificates
    certbot --nginx \
        -d "${backend_host}" \
        -d "${frontend_host}" \
        --non-interactive \
        --agree-tos \
        --email "${email}" \
        --redirect \
        --expand

    # Setup auto-renewal
    cat > /etc/cron.d/certbot-renewal <<EOF
0 2 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

    log SUCCESS "SSL certificates installed ✓"
}

setup_firewall() {
    log INFO "Configuring firewall..."

    # Allow SSH, HTTP, HTTPS
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'

    # Enable firewall
    ufw --force enable

    log SUCCESS "Firewall configured ✓"
}

setup_cron_jobs() {
    local company=$1

    log INFO "Setting up cron jobs..."

    # Database backup
    cat > /etc/cron.d/chatia-backup <<EOF
0 3 * * * deploy pg_dump -U ${company} ${company} | gzip > ${BASE_DIR}/${company}/backups/db-\$(date +\%Y\%m\%d).sql.gz
0 4 * * 0 deploy find ${BASE_DIR}/${company}/backups -name "*.sql.gz" -mtime +30 -delete
EOF

    # Log rotation
    cat > /etc/logrotate.d/chatia <<EOF
${LOG_DIR}/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 640 deploy deploy
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

    # Create backup directory
    mkdir -p "${BASE_DIR}/${company}/backups"
    chown deploy:deploy "${BASE_DIR}/${company}/backups"

    log SUCCESS "Cron jobs configured ✓"
}

#=========================== INTERACTIVE WIZARD ================================

print_banner() {
    cat <<'EOF'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     ██████╗██╗  ██╗ █████╗ ████████╗██╗ █████╗             ║
║    ██╔════╝██║  ██║██╔══██╗╚══██╔══╝██║██╔══██╗            ║
║    ██║     ███████║███████║   ██║   ██║███████║            ║
║    ██║     ██╔══██║██╔══██║   ██║   ██║██╔══██║            ║
║    ╚██████╗██║  ██║██║  ██║   ██║   ██║██║  ██║            ║
║     ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝╚═╝  ╚═╝            ║
║                                                              ║
║              F L O W   I N S T A L L E R   v6.0             ║
║                                                              ║
║           Ultra-optimized with GitHub Actions               ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo
}

wizard_prompt() {
    local prompt=$1
    local var_name=$2
    local validator=${3:-}
    local default=${4:-}

    while true; do
        if [[ -n "$default" ]]; then
            read -p "$(echo -e "${CYAN}${prompt} ${DIM}[${default}]${NC}: ")" value
            value=${value:-$default}
        else
            read -p "$(echo -e "${CYAN}${prompt}${NC}: ")" value
        fi

        if [[ -z "$value" && -z "$default" ]]; then
            log ERROR "This field is required"
            continue
        fi

        if [[ -n "$validator" ]]; then
            if ! $validator "$value"; then
                log ERROR "Invalid value"
                continue
            fi
        fi

        eval "$var_name=\"$value\""
        break
    done
}

wizard_password() {
    local prompt=$1
    local var_name=$2

    while true; do
        read -s -p "$(echo -e "${CYAN}${prompt}${NC}: ")" password
        echo

        if [[ -z "$password" ]]; then
            log ERROR "Password cannot be empty"
            continue
        fi

        if [[ ${#password} -lt 8 ]]; then
            log ERROR "Password must be at least 8 characters"
            continue
        fi

        read -s -p "$(echo -e "${CYAN}Confirm password${NC}: ")" password2
        echo

        if [[ "$password" != "$password2" ]]; then
            log ERROR "Passwords do not match"
            continue
        fi

        eval "$var_name=\"$password\""
        break
    done
}

run_wizard() {
    print_banner

    log INFO "Welcome to ChatIA Flow Installer!"
    echo

    # Company name
    wizard_prompt "Enter your company name (alphanumeric, no spaces)" "COMPANY" "" ""
    COMPANY=$(echo "$COMPANY" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')

    # URLs
    wizard_prompt "Backend URL (e.g., api.example.com)" "BACKEND_URL" "" ""
    wizard_prompt "Frontend URL (e.g., app.example.com)" "FRONTEND_URL" "" ""

    # Strip protocol if provided
    BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|https\?://||')
    FRONTEND_URL=$(echo "$FRONTEND_URL" | sed 's|https\?://||')

    # Admin credentials
    wizard_prompt "Admin email" "ADMIN_EMAIL" "validate_email" ""
    wizard_password "Admin password" "ADMIN_PASSWORD"

    # Database password
    wizard_password "Database password" "DEPLOY_PASSWORD"

    # Support phone
    wizard_prompt "Support phone (numbers only)" "SUPPORT_PHONE" "" ""

    # Optional: Facebook integration
    read -p "$(echo -e "${CYAN}Configure Facebook integration? (y/N)${NC}: ")" fb_setup
    if [[ "$fb_setup" =~ ^[Yy]$ ]]; then
        wizard_prompt "Facebook App ID" "FB_APP_ID" "" ""
        wizard_prompt "Facebook App Secret" "FB_APP_SECRET" "" ""
    fi

    # Optional: GitHub token for private repos
    read -p "$(echo -e "${CYAN}Using a private GitHub repository? (y/N)${NC}: ")" private_repo
    if [[ "$private_repo" =~ ^[Yy]$ ]]; then
        wizard_prompt "GitHub personal access token" "GITHUB_TOKEN" "" ""
    fi

    # DNS validation
    read -p "$(echo -e "${CYAN}Validate DNS before installation? (Y/n)${NC}: ")" validate_dns
    SKIP_DNS_VALIDATION=false
    if [[ "$validate_dns" =~ ^[Nn]$ ]]; then
        SKIP_DNS_VALIDATION=true
    fi

    # SSL setup
    read -p "$(echo -e "${CYAN}Setup SSL certificates? (Y/n)${NC}: ")" setup_ssl
    SKIP_SSL_SETUP=false
    if [[ "$setup_ssl" =~ ^[Nn]$ ]]; then
        SKIP_SSL_SETUP=true
    fi

    # Summary
    echo
    echo -e "${BOLD}${GREEN}=== Installation Summary ===${NC}"
    echo -e "${CYAN}Company:${NC} $COMPANY"
    echo -e "${CYAN}Backend:${NC} https://$BACKEND_URL"
    echo -e "${CYAN}Frontend:${NC} https://$FRONTEND_URL"
    echo -e "${CYAN}Admin Email:${NC} $ADMIN_EMAIL"
    echo -e "${CYAN}DNS Validation:${NC} $([[ "$SKIP_DNS_VALIDATION" == "true" ]] && echo "Skip" || echo "Yes")"
    echo -e "${CYAN}SSL Setup:${NC} $([[ "$SKIP_SSL_SETUP" == "true" ]] && echo "Skip" || echo "Yes")"
    echo

    read -p "$(echo -e "${YELLOW}Proceed with installation? (y/N)${NC}: ")" confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log WARN "Installation cancelled"
        exit 0
    fi
}

#=========================== MAIN INSTALLATION =================================

main() {
    # Create log directory
    mkdir -p "$LOG_DIR"

    # Start logging
    exec 1> >(tee -a "$LOG_FILE")
    exec 2>&1

    log INFO "Starting ChatIA Flow installation..."
    log INFO "Log file: $LOG_FILE"

    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        log ERROR "This script must be run as root"
        exit 1
    fi

    # Run system checks
    if ! check_system_requirements; then
        log ERROR "System requirements not met"
        exit 1
    fi

    # Run wizard if not in non-interactive mode
    if [[ "${NON_INTERACTIVE:-false}" != "true" ]]; then
        run_wizard
    else
        # Load environment variables for non-interactive mode
        : "${COMPANY:?Variable COMPANY is required}"
        : "${BACKEND_URL:?Variable BACKEND_URL is required}"
        : "${FRONTEND_URL:?Variable FRONTEND_URL is required}"
        : "${ADMIN_EMAIL:?Variable ADMIN_EMAIL is required}"
        : "${ADMIN_PASSWORD:?Variable ADMIN_PASSWORD is required}"
        : "${DEPLOY_PASSWORD:?Variable DEPLOY_PASSWORD is required}"
        : "${SUPPORT_PHONE:?Variable SUPPORT_PHONE is required}"
    fi

    # Get public IP
    PUBLIC_IP=$(get_public_ip)
    if [[ -z "$PUBLIC_IP" ]]; then
        log ERROR "Failed to determine public IP"
        exit 1
    fi
    log INFO "Public IP: $PUBLIC_IP"

    # DNS validation (unless skipped)
    if [[ "$SKIP_DNS_VALIDATION" != "true" ]]; then
        validate_dns "$BACKEND_URL" "$PUBLIC_IP" || exit 1
        validate_dns "$FRONTEND_URL" "$PUBLIC_IP" || exit 1
    fi

    # Save initial state
    save_state "INSTALLATION_STARTED" "$(date -Iseconds)"
    save_state "COMPANY" "$COMPANY"

    # Installation steps
    install_dependencies
    setup_user "$COMPANY"
    setup_database "$COMPANY" "$DEPLOY_PASSWORD"

    # Try to download artifacts or use local build
    if ! download_artifacts "$COMPANY"; then
        log WARN "Failed to download artifacts from GitHub Release"

        # Check if we can build locally
        if [[ -d "backend" && -d "frontend" ]]; then
            log INFO "Found local source code. Would you like to build locally instead?"
            read -p "$(echo -e "${YELLOW}Build from source? (y/N)${NC}: ")" build_local

            if [[ "$build_local" =~ ^[Yy]$ ]]; then
                build_from_source "$COMPANY"
            else
                log ERROR "Cannot proceed without artifacts"
                exit 1
            fi
        else
            log ERROR "No local source code found and no release artifacts available"
            log INFO "Please ensure GitHub Actions has completed: https://github.com/${GITHUB_REPO}/actions"
            exit 1
        fi
    fi
    configure_environment "$COMPANY" "$BACKEND_URL" "$FRONTEND_URL" "$ADMIN_EMAIL" \
        "$DEPLOY_PASSWORD" "$ADMIN_PASSWORD" "$SUPPORT_PHONE" "${FB_APP_ID:-}" "${FB_APP_SECRET:-}"
    run_migrations "$COMPANY"
    setup_pm2_services "$COMPANY"
    setup_nginx "$COMPANY" "$BACKEND_URL" "$FRONTEND_URL"

    # Optional: SSL setup
    if [[ "$SKIP_SSL_SETUP" != "true" ]]; then
        setup_ssl "$BACKEND_URL" "$FRONTEND_URL" "$ADMIN_EMAIL"
    fi

    # Security and maintenance
    setup_firewall
    setup_cron_jobs "$COMPANY"

    # Save completion state
    save_state "INSTALLATION_COMPLETED" "$(date -Iseconds)"

    # Print success message
    echo
    echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║           INSTALLATION COMPLETED SUCCESSFULLY!               ║${NC}"
    echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${CYAN}${BOLD}Access URLs:${NC}"
    echo -e "  Frontend: ${GREEN}https://${FRONTEND_URL}${NC}"
    echo -e "  Backend:  ${GREEN}https://${BACKEND_URL}${NC}"
    echo
    echo -e "${CYAN}${BOLD}Credentials:${NC}"
    echo -e "  Email:    ${GREEN}${ADMIN_EMAIL}${NC}"
    echo -e "  Password: ${GREEN}${ADMIN_PASSWORD}${NC}"
    echo
    echo -e "${CYAN}${BOLD}Services:${NC}"
    echo -e "  PM2:      ${GREEN}pm2 status${NC}"
    echo -e "  Logs:     ${GREEN}pm2 logs${NC}"
    echo -e "  Monitor:  ${GREEN}pm2 monit${NC}"
    echo
    echo -e "${YELLOW}${BOLD}Next steps:${NC}"
    echo -e "  1. Access the frontend URL and login"
    echo -e "  2. Configure WhatsApp connections"
    echo -e "  3. Setup your team and permissions"
    echo -e "  4. Import contacts and start messaging!"
    echo
    echo -e "${DIM}Installation log: ${LOG_FILE}${NC}"
    echo
}

# Run main function
main "$@"