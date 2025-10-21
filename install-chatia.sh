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

# GitHub Configuration (can be overridden)
GITHUB_REPO="${GITHUB_REPO:-bruno-vilefort-tech-consulting/Projeto-Rodrigo}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
# Forçar sempre clone do código real (não usar releases)
FORCE_BUILD_FROM_SOURCE="${FORCE_BUILD_FROM_SOURCE:-true}"

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

    # Export to ensure non-interactive mode
    export DEBIAN_FRONTEND=noninteractive

    # Update package list
    apt-get update -qq

    # Stage 0: Fix Nginx configuration BEFORE trying to fix packages
    # This prevents dpkg --configure -a from failing on nginx

    # First, stop any running nginx to avoid conflicts
    systemctl stop nginx 2>/dev/null || true

    if [[ ! -f /etc/nginx/nginx.conf ]]; then
        log INFO "Creating default nginx.conf to fix potential nginx issues..."
        mkdir -p /etc/nginx
        mkdir -p /etc/nginx/sites-available
        mkdir -p /etc/nginx/sites-enabled
        mkdir -p /etc/nginx/conf.d
        mkdir -p /etc/nginx/modules-enabled
        mkdir -p /var/log/nginx
        mkdir -p /var/cache/nginx
        mkdir -p /var/lib/nginx

        # Create a proper user for nginx if it doesn't exist
        id -u www-data &>/dev/null || useradd -r -s /bin/false www-data

        # Ensure proper permissions on nginx directories
        chown -R www-data:www-data /var/log/nginx 2>/dev/null || true
        chmod 755 /var/log/nginx

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

        # Create mime.types if it doesn't exist
        if [[ ! -f /etc/nginx/mime.types ]]; then
            log INFO "Creating mime.types file..."
            cat > /etc/nginx/mime.types <<'MIME_TYPES'
types {
    text/html                             html htm shtml;
    text/css                              css;
    text/xml                              xml;
    image/gif                             gif;
    image/jpeg                            jpeg jpg;
    application/javascript                js;
    application/atom+xml                  atom;
    application/rss+xml                   rss;
    text/plain                            txt;
    text/x-component                      htc;
    image/png                             png;
    image/svg+xml                         svg svgz;
    image/webp                            webp;
    application/json                      json;
    application/pdf                       pdf;
    application/zip                       zip;
    application/x-font-ttf                ttc ttf;
    application/x-font-opentype           otf;
    application/vnd.ms-fontobject         eot;
    font/woff                             woff;
    font/woff2                            woff2;
    video/mp4                             mp4;
    video/webm                            webm;
    audio/mpeg                            mp3;
    audio/ogg                             ogg;
}
MIME_TYPES
        fi
    fi

    # Now that nginx.conf exists, we can safely fix broken packages
    log INFO "Fixing any broken packages..."

    # Special handling for nginx if it's broken
    if dpkg -l | grep -q -E "^[piuhr][^i].*nginx" || dpkg -l | grep -q "^iF.*nginx"; then
        log INFO "Found broken nginx packages, removing them first..."
        # Force stop nginx service if it exists
        systemctl stop nginx 2>/dev/null || true
        systemctl disable nginx 2>/dev/null || true
        # Remove all nginx packages
        apt-get remove --purge -y nginx nginx-common nginx-core nginx-full nginx-light nginx-extras 2>/dev/null || true
        apt-get autoremove -y 2>/dev/null || true
        # Clean package cache
        apt-get clean
        # Update package list again
        apt-get update -qq
    fi

    apt-get install -f -y || true
    dpkg --configure -a || true

    # Set dpkg options to avoid prompts
    local APT_OPTIONS="-o Dpkg::Options::=--force-confnew -o Dpkg::Options::=--force-confdef"

    # Stage 1: Basic tools
    log INFO "Installing basic tools..."
    apt-get install -y $APT_OPTIONS \
        curl wget git jq software-properties-common build-essential || {
        log ERROR "Failed to install basic tools"
        return 1
    }

    # Stage 2: Database
    log INFO "Installing PostgreSQL and Redis..."
    apt-get install -y $APT_OPTIONS \
        postgresql postgresql-client postgresql-contrib redis-server || {
        log ERROR "Failed to install databases"
        return 1
    }

    # Stage 3: Nginx
    log INFO "Installing Nginx..."
    apt-get install -y $APT_OPTIONS nginx || {
        log WARN "Nginx installation had issues, trying to fix..."

        # Try to fix nginx installation
        systemctl stop nginx 2>/dev/null || true
        apt-get remove -y nginx nginx-common nginx-core 2>/dev/null || true
        apt-get autoremove -y 2>/dev/null || true
        apt-get install -y $APT_OPTIONS nginx || {
            log ERROR "Failed to install nginx after retry"
            return 1
        }
    }

    # Stage 4: Certbot (optional, don't fail if it doesn't install)
    log INFO "Installing Certbot..."
    apt-get install -y $APT_OPTIONS certbot python3-certbot-nginx || {
        log WARN "Certbot installation failed, SSL setup will be skipped"
    }

    # Stage 5: Additional tools
    log INFO "Installing additional tools..."
    apt-get install -y $APT_OPTIONS ufw fail2ban htop || {
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

    # Ensure PostgreSQL is installed and configured
    if ! command -v psql &> /dev/null; then
        log ERROR "PostgreSQL is not installed. Please run install_dependencies first."
        return 1
    fi

    # Stop PostgreSQL first to ensure clean state
    systemctl stop postgresql 2>/dev/null || true

    # Get PostgreSQL version
    local pg_version=""
    if command -v pg_config &> /dev/null; then
        pg_version=$(pg_config --version | grep -oP '\d+' | head -1)
    else
        # Fallback: try to detect installed version
        pg_version=$(ls /usr/lib/postgresql/ 2>/dev/null | grep -E '^[0-9]+$' | sort -V | tail -1)
    fi

    if [[ -z "$pg_version" ]]; then
        log ERROR "Could not determine PostgreSQL version"
        return 1
    fi

    log INFO "Detected PostgreSQL version: ${pg_version}"

    # Check if PostgreSQL cluster exists
    local pg_data_dir="/var/lib/postgresql/${pg_version}/main"

    if [[ ! -d "$pg_data_dir" ]] || [[ ! -f "$pg_data_dir/PG_VERSION" ]]; then
        log INFO "PostgreSQL cluster not found. Creating new cluster..."

        # For Ubuntu/Debian, use pg_createcluster
        if command -v pg_createcluster &> /dev/null; then
            pg_createcluster ${pg_version} main --start 2>/dev/null || {
                log WARN "pg_createcluster failed, trying manual initialization..."

                # Manual initialization as fallback
                mkdir -p "$pg_data_dir"
                chown -R postgres:postgres "/var/lib/postgresql/${pg_version}"
                sudo -u postgres /usr/lib/postgresql/${pg_version}/bin/initdb -D "$pg_data_dir" --locale=C.UTF-8 --encoding=UTF8
            }
        else
            # Direct initdb for non-Debian systems
            mkdir -p "$pg_data_dir"
            chown -R postgres:postgres "/var/lib/postgresql/${pg_version}"
            sudo -u postgres /usr/lib/postgresql/${pg_version}/bin/initdb -D "$pg_data_dir" --locale=C.UTF-8 --encoding=UTF8
        fi
    fi

    # Ensure PostgreSQL config exists
    if [[ ! -f "/etc/postgresql/${pg_version}/main/postgresql.conf" ]]; then
        log INFO "Creating PostgreSQL configuration..."
        mkdir -p "/etc/postgresql/${pg_version}/main"

        # Try to copy from template or create basic config
        if [[ -f "/usr/share/postgresql/${pg_version}/postgresql.conf.sample" ]]; then
            cp "/usr/share/postgresql/${pg_version}/postgresql.conf.sample" "/etc/postgresql/${pg_version}/main/postgresql.conf"
        else
            # Create minimal config
            cat > "/etc/postgresql/${pg_version}/main/postgresql.conf" <<PGCONF
# Minimal PostgreSQL configuration
listen_addresses = 'localhost'
port = 5432
max_connections = 100
shared_buffers = 128MB
dynamic_shared_memory_type = posix
log_timezone = 'UTC'
datestyle = 'iso, mdy'
timezone = 'UTC'
lc_messages = 'C.UTF-8'
lc_monetary = 'C.UTF-8'
lc_numeric = 'C.UTF-8'
lc_time = 'C.UTF-8'
default_text_search_config = 'pg_catalog.english'
PGCONF
        fi

        chown postgres:postgres "/etc/postgresql/${pg_version}/main/postgresql.conf"
    fi

    # Ensure pg_hba.conf exists with proper authentication
    if [[ ! -f "/etc/postgresql/${pg_version}/main/pg_hba.conf" ]]; then
        log INFO "Creating pg_hba.conf..."
        cat > "/etc/postgresql/${pg_version}/main/pg_hba.conf" <<PGHBA
# PostgreSQL Client Authentication Configuration
local   all             postgres                                peer
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
PGHBA
        chown postgres:postgres "/etc/postgresql/${pg_version}/main/pg_hba.conf"
    fi

    # Ensure socket directory exists
    if [[ ! -d /var/run/postgresql ]]; then
        log INFO "Creating PostgreSQL socket directory..."
        mkdir -p /var/run/postgresql
        chown postgres:postgres /var/run/postgresql
        chmod 2775 /var/run/postgresql
    fi

    # Start PostgreSQL service
    log INFO "Starting PostgreSQL service..."
    systemctl enable postgresql

    # Try different methods to start PostgreSQL
    if ! systemctl start postgresql; then
        log WARN "systemctl start failed, trying service command..."
        service postgresql start || {
            log WARN "service command failed, trying pg_ctlcluster..."
            pg_ctlcluster ${pg_version} main start || {
                log ERROR "All PostgreSQL start methods failed"

                # Try to start manually as last resort
                log INFO "Attempting manual PostgreSQL start..."
                sudo -u postgres /usr/lib/postgresql/${pg_version}/bin/pg_ctl \
                    -D "/var/lib/postgresql/${pg_version}/main" \
                    -l "/var/log/postgresql/postgresql-${pg_version}-main.log" \
                    start || {
                    log ERROR "Manual start also failed"

                    # Check logs for errors
                    log INFO "PostgreSQL logs:"
                    tail -50 /var/log/postgresql/*.log 2>/dev/null || true
                    return 1
                }
            }
        }
    fi

    # Wait for PostgreSQL to be ready (max 30 seconds)
    local max_attempts=30
    local attempt=0

    log INFO "Waiting for PostgreSQL to become ready..."
    while [ $attempt -lt $max_attempts ]; do
        # Try multiple methods to check if PostgreSQL is ready
        if sudo -u postgres pg_isready -q 2>/dev/null; then
            log SUCCESS "PostgreSQL is ready (pg_isready) ✓"
            break
        elif sudo -u postgres psql -c "SELECT 1;" >/dev/null 2>&1; then
            log SUCCESS "PostgreSQL is ready (psql test) ✓"
            break
        fi

        attempt=$((attempt + 1))
        if [ $attempt -eq $max_attempts ]; then
            log ERROR "PostgreSQL failed to become ready after ${max_attempts} seconds"
            log INFO "Checking PostgreSQL status..."
            systemctl status postgresql --no-pager || true

            # Check for socket files
            log INFO "Checking for PostgreSQL socket files..."
            ls -la /var/run/postgresql/ 2>/dev/null || true
            find /tmp -name ".s.PGSQL.*" 2>/dev/null || true

            # Check PostgreSQL processes
            log INFO "Checking PostgreSQL processes..."
            ps aux | grep postgres || true

            return 1
        fi

        # Show progress
        if [ $((attempt % 5)) -eq 0 ]; then
            log INFO "Still waiting for PostgreSQL... (${attempt}/${max_attempts})"
        fi

        sleep 1
    done

    # Additional wait for complete initialization
    sleep 2

    # Create role and database
    log INFO "Creating database and user..."

    # Change to postgres home to avoid permission warnings
    cd /var/lib/postgresql

    # First create the role if it doesn't exist
    sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = '${company}'" 2>/dev/null | grep -q 1 || {
        log INFO "Creating PostgreSQL user: ${company}"
        sudo -u postgres psql -c "CREATE ROLE ${company} LOGIN PASSWORD '${password}';" 2>/dev/null
    }

    # Then create the database if it doesn't exist
    sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '${company}'" 2>/dev/null | grep -q 1 || {
        log INFO "Creating database: ${company}"
        sudo -u postgres psql -c "CREATE DATABASE ${company} OWNER ${company};" 2>/dev/null
    }

    # Grant privileges
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${company} TO ${company};" 2>/dev/null

    # Also ensure the user can create schemas (needed for migrations)
    sudo -u postgres psql -d ${company} -c "GRANT CREATE ON SCHEMA public TO ${company};" 2>/dev/null || true

    # Return to previous directory
    cd - >/dev/null

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
        log WARN "Release ${GITHUB_TAG} not found in ${GITHUB_REPO}"

        # Check for latest release as fallback
        log INFO "Checking for latest release..."
        local latest_api_url="https://api.github.com/repos/${GITHUB_REPO}/releases/latest"

        if curl "${curl_opts[@]}" "$latest_api_url" > /tmp/latest_release.json 2>&1; then
            local latest_tag=$(jq -r '.tag_name' /tmp/latest_release.json 2>/dev/null)

            if [[ -n "$latest_tag" && "$latest_tag" != "null" ]]; then
                log INFO "Found latest release: ${latest_tag}"
                log INFO "Would you like to use ${latest_tag} instead? (y/n)"

                if [[ "$NON_INTERACTIVE" == "true" ]]; then
                    log INFO "Non-interactive mode: using latest release ${latest_tag}"
                    GITHUB_TAG="$latest_tag"
                    return 0
                else
                    read -r answer
                    if [[ "$answer" == "y" || "$answer" == "Y" ]]; then
                        GITHUB_TAG="$latest_tag"
                        log SUCCESS "Using release ${GITHUB_TAG} ✓"
                        return 0
                    fi
                fi
            fi
        fi

        log ERROR "No suitable release found"
        log ERROR "Please check:"
        log ERROR "  1. The repository exists: https://github.com/${GITHUB_REPO}"
        log ERROR "  2. At least one release has been created"
        log ERROR "  3. The GitHub Actions workflow has completed successfully"
        return 1
    fi
}

create_frontend_server() {
    local target_dir=$1
    cat > "${target_dir}/server.js" <<'FRONTEND_SERVER'
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Handle React routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Frontend server closed');
    });
});
FRONTEND_SERVER
    chmod +x "${target_dir}/server.js"
}

clone_repository() {
    local company="${1:-chatia}"
    local temp_dir="/tmp/chatia-source-$(date +%s)"
    local current_dir=$(pwd)

    log INFO "========================================="
    log INFO "Cloning ChatIA Flow repository"
    log INFO "Repository: ${GITHUB_REPO}"
    log INFO "Branch: ${GITHUB_BRANCH}"
    log INFO "========================================="

    # Prepare GitHub URL with optional token
    local github_url="https://github.com/${GITHUB_REPO}.git"
    if [[ -n "${GITHUB_TOKEN}" ]]; then
        github_url="https://${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git"
        log INFO "Using GitHub token for authentication"
    fi

    # Ensure we're in the right directory
    mkdir -p "${BASE_DIR}/${company}"
    cd "${BASE_DIR}/${company}"

    # Remove any existing source directories to start fresh
    if [[ -d "backend" ]] || [[ -d "frontend" ]]; then
        log WARN "Removing existing source directories..."
        rm -rf backend frontend 2>/dev/null || true
    fi

    # Try to clone with the specified branch first
    log INFO "Attempting to clone branch: ${GITHUB_BRANCH}..."
    if git clone --depth=1 --branch "${GITHUB_BRANCH}" --single-branch "$github_url" "$temp_dir" 2>&1 | tee -a "$LOG_FILE"; then
        log SUCCESS "Repository cloned successfully from branch ${GITHUB_BRANCH}"
    else
        # If specified branch fails, try main branch
        log WARN "Branch ${GITHUB_BRANCH} not found, trying 'main' branch..."
        if git clone --depth=1 --branch main --single-branch "$github_url" "$temp_dir" 2>&1 | tee -a "$LOG_FILE"; then
            log SUCCESS "Repository cloned successfully from main branch"
        else
            # Last attempt: clone without specifying branch
            log WARN "Trying to clone default branch..."
            if git clone --depth=1 "$github_url" "$temp_dir" 2>&1 | tee -a "$LOG_FILE"; then
                log SUCCESS "Repository cloned successfully from default branch"
            else
                log ERROR "All clone attempts failed!"
                rm -rf "$temp_dir" 2>/dev/null
                cd "$current_dir"
                return 1
            fi
        fi
    fi

    # Verify the repository structure - check both root and chatia subdirectory
    local backend_path=""
    local frontend_path=""

    # First check if backend/frontend are in the root
    if [[ -d "$temp_dir/backend" ]] && [[ -d "$temp_dir/frontend" ]]; then
        log INFO "Found backend and frontend in repository root"
        backend_path="$temp_dir/backend"
        frontend_path="$temp_dir/frontend"
    # Then check if they're inside a chatia subdirectory
    elif [[ -d "$temp_dir/chatia/backend" ]] && [[ -d "$temp_dir/chatia/frontend" ]]; then
        log INFO "Found backend and frontend in chatia/ subdirectory"
        backend_path="$temp_dir/chatia/backend"
        frontend_path="$temp_dir/chatia/frontend"
    # Also check for capital Chatia
    elif [[ -d "$temp_dir/Chatia/backend" ]] && [[ -d "$temp_dir/Chatia/frontend" ]]; then
        log INFO "Found backend and frontend in Chatia/ subdirectory"
        backend_path="$temp_dir/Chatia/backend"
        frontend_path="$temp_dir/Chatia/frontend"
    else
        log ERROR "Repository doesn't contain expected backend/frontend directories!"
        log ERROR "Searched in: root, chatia/, and Chatia/"
        log ERROR "Repository structure:"
        ls -la "$temp_dir" | head -20 | tee -a "$LOG_FILE"
        if [[ -d "$temp_dir/chatia" ]]; then
            log ERROR "Contents of chatia/:"
            ls -la "$temp_dir/chatia" | head -20 | tee -a "$LOG_FILE"
        fi
        rm -rf "$temp_dir"
        cd "$current_dir"
        return 1
    fi

    # Move the source code to deployment directory
    log INFO "Moving source code to ${BASE_DIR}/${company}/"
    mv "$backend_path" ./backend
    mv "$frontend_path" ./frontend

    # Clean up
    rm -rf "$temp_dir"

    # Verify move was successful
    if [[ -d "backend" ]] && [[ -d "frontend" ]]; then
        log SUCCESS "Source code successfully deployed"
        log INFO "Backend location: ${BASE_DIR}/${company}/backend"
        log INFO "Frontend location: ${BASE_DIR}/${company}/frontend"
        cd "$current_dir"
        return 0
    else
        log ERROR "Failed to move source code to deployment directory"
        cd "$current_dir"
        return 1
    fi
}

create_minimal_structure() {
    local company=$1

    log WARN "Creating minimal placeholder structure (real code not available)..."
    log WARN "This is a fallback - the system will need real code to function properly"

    # Always create directories if they don't exist
    mkdir -p "${BASE_DIR}/${company}/backend/dist"
    mkdir -p "${BASE_DIR}/${company}/frontend/build"

    # Only create backend server if it doesn't exist
    if [[ ! -f "${BASE_DIR}/${company}/backend/dist/server.js" ]]; then
        cat > "${BASE_DIR}/${company}/backend/dist/server.js" <<MINIMAL_BACKEND
#!/usr/bin/env node
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'ChatIA Flow Backend - Placeholder' });
});

app.get('/', (req, res) => {
    res.json({
        message: 'ChatIA Flow Backend - Minimal placeholder',
        note: 'Please deploy your actual backend code to this directory',
        path: '/home/deploy/${company}/backend/',
        time: new Date().toISOString()
    });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Minimal backend server running on port \${PORT}\`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Backend server closed');
    });
});
MINIMAL_BACKEND

        # Make backend executable
        chmod +x "${BASE_DIR}/${company}/backend/dist/server.js"
    fi

    # Create package.json for backend if it doesn't exist
    if [[ ! -f "${BASE_DIR}/${company}/backend/package.json" ]]; then
        cat > "${BASE_DIR}/${company}/backend/package.json" <<BACKEND_PACKAGE
{
    "name": "chatia-backend-placeholder",
    "version": "1.0.0",
    "main": "dist/server.js",
    "scripts": {
        "start": "node dist/server.js"
    },
    "dependencies": {
        "express": "^4.18.2"
    }
}
BACKEND_PACKAGE
    fi

    # Only create frontend server if it doesn't exist
    if [[ ! -f "${BASE_DIR}/${company}/frontend/build/server.js" ]]; then
        cat > "${BASE_DIR}/${company}/frontend/build/server.js" <<MINIMAL_FRONTEND
#!/usr/bin/env node
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('*', (req, res) => {
    res.send(\`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChatIA Flow</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            text-align: center;
            padding: 3rem;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            max-width: 600px;
            margin: 2rem;
        }
        h1 {
            margin-bottom: 1.5rem;
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .status {
            background: rgba(0,255,0,0.2);
            color: #00ff88;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 2rem;
            font-weight: bold;
        }
        .info {
            background: rgba(0,0,0,0.3);
            padding: 1.5rem;
            border-radius: 10px;
            margin-top: 2rem;
            text-align: left;
        }
        .info h3 {
            margin-bottom: 1rem;
            color: #ffd700;
        }
        .info p {
            margin: 0.5rem 0;
            font-family: monospace;
            font-size: 0.9rem;
            opacity: 0.9;
        }
        .paths {
            background: rgba(0,0,0,0.2);
            padding: 1rem;
            border-radius: 5px;
            margin-top: 1rem;
        }
        .footer {
            margin-top: 2rem;
            opacity: 0.7;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ChatIA Flow</h1>
        <div class="status">✅ Instalação Concluída</div>

        <p>O sistema está pronto para receber o código da aplicação.</p>

        <div class="info">
            <h3>📋 Próximos Passos:</h3>
            <div class="paths">
                <p><strong>1. Deploy do Backend:</strong></p>
                <p>/home/deploy/${company}/backend/</p>
                <br>
                <p><strong>2. Deploy do Frontend:</strong></p>
                <p>/home/deploy/${company}/frontend/build/</p>
                <br>
                <p><strong>3. Executar Migrations:</strong></p>
                <p>cd /home/deploy/${company}/backend && npx sequelize db:migrate</p>
                <br>
                <p><strong>4. Reiniciar PM2:</strong></p>
                <p>pm2 restart all</p>
            </div>
        </div>

        <div class="footer">
            <p>ChatIA Flow v6.0 - Sistema Multi-tenant de Atendimento</p>
        </div>
    </div>
</body>
</html>
    \`);
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Minimal frontend server running on port \${PORT}\`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Frontend server closed');
    });
});
MINIMAL_FRONTEND

        # Make frontend executable
        chmod +x "${BASE_DIR}/${company}/frontend/build/server.js"
    fi

    # Create package.json for frontend if it doesn't exist
    if [[ ! -f "${BASE_DIR}/${company}/frontend/build/package.json" ]]; then
        cat > "${BASE_DIR}/${company}/frontend/build/package.json" <<FRONTEND_PACKAGE
{
    "name": "chatia-frontend-placeholder",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": {
        "start": "node server.js"
    },
    "dependencies": {
        "express": "^4.18.2"
    }
}
FRONTEND_PACKAGE
    fi

    # Create frontend package.json at root level too (PM2 may look here) if it doesn't exist
    if [[ ! -f "${BASE_DIR}/${company}/frontend/package.json" ]]; then
        cat > "${BASE_DIR}/${company}/frontend/package.json" <<FRONTEND_ROOT_PACKAGE
{
    "name": "chatia-frontend",
    "version": "1.0.0",
    "scripts": {
        "start": "cd build && node server.js"
    }
}
FRONTEND_ROOT_PACKAGE
    fi

    # Install minimal dependencies
    log INFO "Installing minimal dependencies..."

    # Backend dependencies
    if [[ -f "${BASE_DIR}/${company}/backend/package.json" ]]; then
        cd "${BASE_DIR}/${company}/backend"
        npm install --production --no-save 2>/dev/null || log WARN "Could not install backend dependencies"
    fi

    # Frontend dependencies
    if [[ -f "${BASE_DIR}/${company}/frontend/build/package.json" ]]; then
        cd "${BASE_DIR}/${company}/frontend/build"
        npm install --production --no-save 2>/dev/null || log WARN "Could not install frontend dependencies"
    fi

    cd / >/dev/null

    # Set ownership
    chown -R deploy:deploy "${BASE_DIR}/${company}"

    # Set proper permissions
    chmod -R 755 "${BASE_DIR}/${company}"

    log SUCCESS "Minimal structure created ✓"
    log WARN "This is a placeholder installation"
    log INFO "To deploy real code:"
    log INFO "  Backend: ${BASE_DIR}/${company}/backend/"
    log INFO "  Frontend: ${BASE_DIR}/${company}/frontend/"
    log INFO ""
    log INFO "After deploying code, run:"
    log INFO "  sudo -u deploy pm2 restart all"
}

build_from_source() {
    local company=$1

    log INFO "Building ChatIA Flow from source code..."

    # Ensure directories exist
    mkdir -p "${BASE_DIR}/${company}/backend"
    mkdir -p "${BASE_DIR}/${company}/frontend"

    # Backend build
    if [[ -d "backend" ]]; then
        log INFO "Building backend (this may take a few minutes)..."
        cd backend

        # Install dependencies
        log INFO "Installing backend dependencies..."
        if command -v pnpm &> /dev/null && [[ -f "pnpm-lock.yaml" ]]; then
            pnpm install --frozen-lockfile || npm install
        elif [[ -f "package-lock.json" ]]; then
            npm ci || npm install
        else
            npm install
        fi

        # Build TypeScript
        log INFO "Compiling TypeScript..."
        if npm run build 2>/dev/null; then
            log SUCCESS "Backend compiled successfully"
        else
            log WARN "Standard build failed, trying alternative..."
            npx tsc || {
                log ERROR "TypeScript compilation failed. Trying to copy source files..."
                mkdir -p dist
                cp -r src/* dist/ 2>/dev/null || true
            }
        fi

        # Deploy backend with proper structure
        log INFO "Deploying backend files..."

        # Copy built files
        if [[ -d "dist" ]]; then
            cp -r dist "${BASE_DIR}/${company}/backend/"
        fi

        # Copy node_modules
        if [[ -d "node_modules" ]]; then
            log INFO "Copying backend dependencies..."
            cp -r node_modules "${BASE_DIR}/${company}/backend/"
        fi

        # Copy configuration files
        cp package*.json "${BASE_DIR}/${company}/backend/" 2>/dev/null || true
        cp .sequelizerc* "${BASE_DIR}/${company}/backend/" 2>/dev/null || true
        cp tsconfig*.json "${BASE_DIR}/${company}/backend/" 2>/dev/null || true

        # Copy database files (preserve structure for migrations)
        if [[ -d "src/database" ]]; then
            mkdir -p "${BASE_DIR}/${company}/backend/src"
            cp -r src/database "${BASE_DIR}/${company}/backend/src/"
        fi

        # Copy public directory if exists (for WhatsApp sessions, etc.)
        if [[ -d "public" ]]; then
            cp -r public "${BASE_DIR}/${company}/backend/"
        fi

        cd ..
        log SUCCESS "Backend built and deployed ✓"
    else
        log ERROR "Backend source not found!"
        return 1
    fi

    # Frontend build
    if [[ -d "frontend" ]]; then
        log INFO "Building frontend (this may take a few minutes)..."
        cd frontend

        # Install dependencies
        log INFO "Installing frontend dependencies..."
        if command -v pnpm &> /dev/null && [[ -f "pnpm-lock.yaml" ]]; then
            pnpm install --shamefully-hoist || npm install --legacy-peer-deps
        elif [[ -f "package-lock.json" ]]; then
            npm ci --legacy-peer-deps || npm install --legacy-peer-deps
        else
            npm install --legacy-peer-deps
        fi

        # Set build environment
        export NODE_OPTIONS="--max-old-space-size=4096"
        export CI=false
        export GENERATE_SOURCEMAP=false

        # Build React app
        log INFO "Building React application..."
        if npm run build 2>/dev/null; then
            log SUCCESS "Frontend built successfully"
        else
            log ERROR "Frontend build failed!"
            cd ..
            return 1
        fi

        # Deploy frontend with proper structure
        log INFO "Deploying frontend files..."

        # Ensure build directory exists
        mkdir -p "${BASE_DIR}/${company}/frontend/build"

        # Copy built files
        if [[ -d "build" ]]; then
            cp -r build/* "${BASE_DIR}/${company}/frontend/build/"
        else
            log ERROR "Build directory not found!"
            cd ..
            return 1
        fi

        # Copy server.js for static serving
        if [[ -f "server.js" ]]; then
            cp server.js "${BASE_DIR}/${company}/frontend/build/"
        else
            # Create a simple server.js if it doesn't exist
            cat > "${BASE_DIR}/${company}/frontend/build/server.js" <<'FRONTEND_SERVER'
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Handle React routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Frontend server closed');
    });
});
FRONTEND_SERVER
        fi

        # Copy package.json for server dependencies
        if [[ -f "package.json" ]]; then
            cp package.json "${BASE_DIR}/${company}/frontend/build/"
        else
            # Create minimal package.json for server
            cat > "${BASE_DIR}/${company}/frontend/build/package.json" <<'FRONTEND_PACKAGE'
{
    "name": "chatia-frontend",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": {
        "start": "node server.js"
    },
    "dependencies": {
        "express": "^4.18.2"
    }
}
FRONTEND_PACKAGE
        fi

        # Install server dependencies
        cd "${BASE_DIR}/${company}/frontend/build"
        npm install --production --omit=dev express 2>/dev/null || true
        cd -

        cd ..
        log SUCCESS "Frontend built and deployed ✓"
    else
        log ERROR "Frontend source not found!"
        return 1
    fi

    # Set proper permissions
    chown -R deploy:deploy "${BASE_DIR}/${company}"

    log SUCCESS "Build from source completed successfully ✓"
    return 0
}

download_artifacts() {
    local company=$1
    local manifest_file="/tmp/manifest.json"
    local manifest_url="https://github.com/${GITHUB_REPO}/releases/download/${GITHUB_TAG}/manifest.json"

    # Skip if SKIP_ARTIFACTS is set
    if [[ "${SKIP_ARTIFACTS:-false}" == "true" ]]; then
        log INFO "Skipping artifact download (manual installation mode)"
        # Create minimal structure since we're skipping artifacts
        create_minimal_structure "$company"
        return 0
    fi

    # Check if release exists first
    if ! check_release_exists; then
        log WARN "No valid release found, creating minimal structure instead"
        create_minimal_structure "$company"
        return 0
    fi

    log INFO "Downloading release manifest..."

    # Download manifest
    if ! download_with_progress "$manifest_url" "$manifest_file" "manifest.json"; then
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

    log INFO "Checking for database migrations..."

    local backend_dir="${BASE_DIR}/${company}/backend"

    if [[ ! -d "$backend_dir" ]]; then
        log WARN "Backend directory not found: $backend_dir"
        log INFO "Skipping migrations (will run when real code is deployed)"
        return 0
    fi

    # Check if this is a real backend or just placeholder
    if [[ ! -f "${backend_dir}/package.json" ]] || ! grep -q '"sequelize"' "${backend_dir}/package.json" 2>/dev/null; then
        log INFO "No Sequelize found in backend. Skipping migrations."
        log INFO "Migrations will run automatically when real code is deployed."
        return 0
    fi

    cd "$backend_dir"

    # Check for migrations directory
    local migrations_dir=""
    if [[ -d "dist/database/migrations" ]]; then
        migrations_dir="dist/database/migrations"
    elif [[ -d "src/database/migrations" ]]; then
        migrations_dir="src/database/migrations"
    elif [[ -d "database/migrations" ]]; then
        migrations_dir="database/migrations"
    else
        log WARN "No migrations directory found"
        cd - >/dev/null
        return 0
    fi

    log INFO "Found migrations in: $migrations_dir"

    # Create or update .sequelizerc
    cat > .sequelizerc <<SEQUELIZERC
const { resolve } = require("path");

module.exports = {
    "config": resolve(__dirname, "dist", "config", "database.js"),
    "models-path": resolve(__dirname, "dist", "models"),
    "migrations-path": resolve(__dirname, "${migrations_dir}"),
    "seeders-path": resolve(__dirname, "dist", "database", "seeds")
};
SEQUELIZERC

    # Ensure sequelize-cli is available
    if ! command -v sequelize &>/dev/null; then
        if ! npx sequelize --version &>/dev/null; then
            log INFO "Installing sequelize-cli..."
            npm install --save-dev sequelize-cli 2>/dev/null || {
                log WARN "Could not install sequelize-cli globally"
                log INFO "Trying with npx..."
            }
        fi
    fi

    # Ensure database config exists
    if [[ ! -f "dist/config/database.js" ]]; then
        log INFO "Creating database configuration..."
        mkdir -p dist/config
        cat > dist/config/database.js <<'DBCONFIG'
require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: process.env.DB_DIALECT || 'postgres',
        timezone: 'America/Sao_Paulo',
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        },
        logging: false
    },
    test: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: process.env.DB_DIALECT || 'postgres',
        timezone: 'America/Sao_Paulo'
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: process.env.DB_DIALECT || 'postgres',
        timezone: 'America/Sao_Paulo',
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        },
        logging: false
    }
};
DBCONFIG
    fi

    # Set proper ownership
    chown -R deploy:deploy .

    # Run migrations as deploy user
    log INFO "Running database migrations..."
    if sudo -u deploy NODE_ENV=production npx sequelize db:migrate 2>&1 | tee -a "$LOG_FILE"; then
        log SUCCESS "Database migrations completed successfully ✓"
    else
        log WARN "Some migrations may have failed or were already applied"
        log INFO "You can check migration status with:"
        log INFO "  cd ${backend_dir}"
        log INFO "  sudo -u deploy npx sequelize db:migrate:status"
    fi

    # Run seeds if they exist (optional)
    if [[ -d "dist/database/seeds" ]] || [[ -d "src/database/seeds" ]]; then
        log INFO "Checking for database seeds..."
        if sudo -u deploy NODE_ENV=production npx sequelize db:seed:all 2>/dev/null; then
            log SUCCESS "Database seeds applied ✓"
        else
            log INFO "Seeds already applied or not required"
        fi
    fi

    cd - >/dev/null
}

setup_pm2_services() {
    local company=$1

    log INFO "Setting up PM2 services..."

    # Ensure PM2 is properly installed and accessible
    if ! command -v pm2 &> /dev/null; then
        log ERROR "PM2 is not installed. Installing..."
        npm install -g pm2
    fi

    # Fix PM2 permissions
    mkdir -p /home/deploy/.pm2
    chown -R deploy:deploy /home/deploy/.pm2
    chmod 755 /home/deploy/.pm2

    # Ensure log directory exists with correct permissions
    mkdir -p "${LOG_DIR}"
    chown -R deploy:deploy "${LOG_DIR}"

    # Check if the server files exist before starting
    if [[ ! -f "${BASE_DIR}/${company}/backend/dist/server.js" ]]; then
        log WARN "Backend server.js not found. Creating placeholder..."
        create_minimal_structure "$company"
    fi

    if [[ ! -f "${BASE_DIR}/${company}/frontend/build/server.js" ]]; then
        log WARN "Frontend server.js not found. Creating placeholder..."
        create_minimal_structure "$company"
    fi

    # Ensure frontend build directory exists
    if [[ ! -d "${BASE_DIR}/${company}/frontend/build" ]]; then
        log INFO "Creating frontend build directory..."
        mkdir -p "${BASE_DIR}/${company}/frontend/build"
    fi

    # Start PM2 as deploy user with proper environment
    # Backend service
    if [[ -f "${BASE_DIR}/${company}/backend/dist/server.js" ]]; then
        su - deploy -c "cd ${BASE_DIR}/${company}/backend && pm2 start dist/server.js \
            --name '${company}-backend' \
            --cwd '${BASE_DIR}/${company}/backend' \
            --merge-logs \
            --log '${LOG_DIR}/${company}-backend.log' \
            --time" || {
            log WARN "Backend PM2 service failed to start."
        }
    else
        log WARN "Backend server.js not found, skipping PM2 start for backend"
    fi

    # Frontend service
    if [[ -f "${BASE_DIR}/${company}/frontend/build/server.js" ]]; then
        su - deploy -c "cd ${BASE_DIR}/${company}/frontend/build && pm2 start server.js \
            --name '${company}-frontend' \
            --cwd '${BASE_DIR}/${company}/frontend/build' \
            --merge-logs \
            --log '${LOG_DIR}/${company}-frontend.log' \
            --time" || {
            log WARN "Frontend PM2 service failed to start."
        }
    else
        log WARN "Frontend server.js not found, skipping PM2 start for frontend"
    fi

    # Save PM2 configuration
    su - deploy -c "pm2 save" || log WARN "Could not save PM2 configuration"

    # Setup PM2 startup
    local startup_cmd=$(su - deploy -c "pm2 startup systemd -u deploy --hp /home/deploy" | grep sudo | tail -1)
    if [[ -n "$startup_cmd" ]]; then
        eval "$startup_cmd" || log WARN "Could not setup PM2 startup"
    fi

    # List PM2 processes for verification
    su - deploy -c "pm2 list"

    # Wait for services to be actually running
    log INFO "Verifying services are running..."
    sleep 3

    # Check backend service status
    local backend_status=$(su - deploy -c "pm2 show ${company}-backend --json 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null || echo 'stopped'")
    if [[ "$backend_status" == "online" ]]; then
        log SUCCESS "Backend PM2 service is online ✓"

        # Try to verify it's actually responding
        if curl -f -s -m 5 "http://localhost:${DEFAULT_BACKEND_PORT}" > /dev/null 2>&1 || \
           curl -f -s -m 5 "http://localhost:${DEFAULT_BACKEND_PORT}/health" > /dev/null 2>&1; then
            log SUCCESS "Backend is responding on port ${DEFAULT_BACKEND_PORT} ✓"
        else
            log WARN "Backend PM2 is running but not responding yet on port ${DEFAULT_BACKEND_PORT}"
            log INFO "Service may need more time to initialize"
        fi
    else
        log WARN "Backend PM2 service is not online (status: $backend_status)"
    fi

    # Check frontend service status
    local frontend_status=$(su - deploy -c "pm2 show ${company}-frontend --json 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null || echo 'stopped'")
    if [[ "$frontend_status" == "online" ]]; then
        log SUCCESS "Frontend PM2 service is online ✓"

        # Try to verify it's actually responding
        if curl -f -s -m 5 "http://localhost:${DEFAULT_FRONTEND_PORT}" > /dev/null 2>&1; then
            log SUCCESS "Frontend is responding on port ${DEFAULT_FRONTEND_PORT} ✓"
        else
            log WARN "Frontend PM2 is running but not responding yet on port ${DEFAULT_FRONTEND_PORT}"
            log INFO "Service may need more time to initialize"
        fi
    else
        log WARN "Frontend PM2 service is not online (status: $frontend_status)"
    fi

    # Show PM2 logs for debugging if services aren't running properly
    if [[ "$backend_status" != "online" ]] || [[ "$frontend_status" != "online" ]]; then
        log INFO "Showing recent PM2 logs for debugging:"
        su - deploy -c "pm2 logs --nostream --lines 5" || true
    fi

    log SUCCESS "PM2 services setup complete ✓"
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

wait_for_service() {
    local service_name=$1
    local url=$2
    local max_retries=${3:-30}
    local retry_count=0

    while [[ $retry_count -lt $max_retries ]]; do
        if curl -f -s -m 5 "$url" > /dev/null 2>&1; then
            log SUCCESS "${service_name} is ready ✓"
            return 0
        fi
        ((retry_count++))
        log INFO "${service_name} not ready yet, retrying... ($retry_count/$max_retries)"
        sleep 2
    done

    log WARN "${service_name} not accessible after $max_retries attempts"
    return 1
}

setup_ssl() {
    local backend_host=$1
    local frontend_host=$2
    local email=$3

    log INFO "Setting up SSL certificates..."

    # Wait a bit for services to fully initialize
    log INFO "Waiting for services to stabilize..."
    sleep 5

    # Wait for backend to be ready with retries
    log INFO "Checking backend availability..."
    local backend_ready=false

    # Try different possible backend URLs
    for backend_url in "http://${backend_host}" "http://${backend_host}/health" "http://localhost:${DEFAULT_BACKEND_PORT}"; do
        if wait_for_service "Backend ($backend_url)" "$backend_url" 20; then
            backend_ready=true
            break
        fi
    done

    if [[ "$backend_ready" != "true" ]]; then
        log WARN "Backend not accessible, continuing without SSL for now"
        log INFO "To setup SSL manually later, run:"
        log INFO "  sudo certbot --nginx -d ${backend_host} -d ${frontend_host}"
        return 0
    fi

    # Wait for frontend to be ready with retries
    log INFO "Checking frontend availability..."
    local frontend_ready=false

    # Try different possible frontend URLs
    for frontend_url in "http://${frontend_host}" "http://localhost:${DEFAULT_FRONTEND_PORT}"; do
        if wait_for_service "Frontend ($frontend_url)" "$frontend_url" 20; then
            frontend_ready=true
            break
        fi
    done

    if [[ "$frontend_ready" != "true" ]]; then
        log WARN "Frontend not accessible, continuing without SSL for now"
        log INFO "To setup SSL manually later, run:"
        log INFO "  sudo certbot --nginx -d ${backend_host} -d ${frontend_host}"
        return 0
    fi

    # Request certificates
    log INFO "Requesting SSL certificates..."
    certbot --nginx \
        -d "${backend_host}" \
        -d "${frontend_host}" \
        --non-interactive \
        --agree-tos \
        --email "${email}" \
        --redirect \
        --expand || {
        log WARN "SSL certificate installation failed"
        log INFO "To retry manually, run:"
        log INFO "  sudo certbot --nginx -d ${backend_host} -d ${frontend_host}"
        return 0
    }

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
        # Show password as it's being typed (no -s flag)
        read -p "$(echo -e "${CYAN}${prompt}${NC}: ")" password

        if [[ -z "$password" ]]; then
            log ERROR "Password cannot be empty"
            continue
        fi

        if [[ ${#password} -lt 8 ]]; then
            log ERROR "Password must be at least 8 characters"
            continue
        fi

        eval "$var_name=\"$password\""
        log SUCCESS "Password set: ${BOLD}${password}${NC} ✓"
        break
    done
}

validate_and_format_phone() {
    local phone=$1
    # Remove all non-numeric characters
    phone=$(echo "$phone" | sed 's/[^0-9]//g')

    if [[ ${#phone} -lt 10 || ${#phone} -gt 15 ]]; then
        return 1
    fi

    echo "$phone"
    return 0
}

run_wizard() {
    clear
    print_banner

    log INFO "Welcome to ChatIA Flow Installer!"
    echo

    # GitHub Repository
    clear
    print_banner
    while true; do
        read -p "$(echo -e "${CYAN}GitHub Repository (owner/repo or full URL)${NC}: ")" input_repo
        if [[ -z "$input_repo" ]]; then
            log ERROR "GitHub repository is required"
            continue
        fi

        # Extract owner/repo from different formats
        # Handle full GitHub URLs: https://github.com/owner/repo or https://github.com/owner/repo.git
        if [[ "$input_repo" =~ github\.com[:/]([a-zA-Z0-9_.-]+)/([a-zA-Z0-9_.-]+) ]]; then
            local owner="${BASH_REMATCH[1]}"
            local repo="${BASH_REMATCH[2]}"
            # Remove .git suffix if present
            repo="${repo%.git}"
            GITHUB_REPO="${owner}/${repo}"
        # Handle owner/repo format
        elif [[ "$input_repo" =~ ^([a-zA-Z0-9_.-]+)/([a-zA-Z0-9_.-]+)$ ]]; then
            GITHUB_REPO="$input_repo"
        else
            log ERROR "Invalid format. Examples:"
            log ERROR "  bruno-vilefort-tech-consulting/Projeto-Rodrigo"
            log ERROR "  https://github.com/bruno-vilefort-tech-consulting/Projeto-Rodrigo"
            log ERROR "  https://github.com/bruno-vilefort-tech-consulting/Projeto-Rodrigo.git"
            continue
        fi

        export GITHUB_REPO
        log SUCCESS "Repository: $GITHUB_REPO ✓"
        break
    done

    # GitHub Tag
    clear
    print_banner
    echo -e "${GREEN}Repository: $GITHUB_REPO${NC}"
    echo
    while true; do
        read -p "$(echo -e "${CYAN}GitHub Release Tag (e.g., v1.0.0)${NC} [v5.0.0]: ")" input_tag
        input_tag=${input_tag:-v5.0.0}

        if [[ -z "$input_tag" ]]; then
            log ERROR "GitHub tag is required"
            continue
        fi

        GITHUB_TAG="$input_tag"
        export GITHUB_TAG
        log SUCCESS "Tag: $GITHUB_TAG ✓"
        break
    done

    # GitHub Token
    clear
    print_banner
    echo -e "${GREEN}Repository: $GITHUB_REPO${NC}"
    echo -e "${GREEN}Tag: $GITHUB_TAG${NC}"
    echo
    read -s -p "$(echo -e "${CYAN}GitHub Personal Access Token (optional, press Enter to skip)${NC}: ")" input_token
    echo
    if [[ -n "$input_token" ]]; then
        GITHUB_TOKEN="$input_token"
        export GITHUB_TOKEN
        log SUCCESS "GitHub token configured ✓"
    else
        GITHUB_TOKEN=""
        log INFO "No GitHub token provided (using public access)"
    fi

    # Company name
    clear
    print_banner
    while true; do
        read -p "$(echo -e "${CYAN}Enter your company name (alphanumeric only)${NC}: ")" COMPANY
        if [[ -z "$COMPANY" ]]; then
            log ERROR "Company name is required"
            continue
        fi
        COMPANY=$(echo "$COMPANY" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
        if [[ -z "$COMPANY" ]]; then
            log ERROR "Company name must contain alphanumeric characters"
            continue
        fi
        log SUCCESS "Company name: $COMPANY ✓"
        break
    done

    # Get public IP for DNS validation
    clear
    print_banner
    echo -e "${GREEN}Company: $COMPANY${NC}"
    echo
    log INFO "Detecting public IP..."
    PUBLIC_IP=$(get_public_ip)
    if [[ -z "$PUBLIC_IP" ]]; then
        log ERROR "Failed to determine public IP"
        exit 1
    fi
    log SUCCESS "Public IP: $PUBLIC_IP ✓"
    sleep 2

    # Backend URL with automatic DNS validation
    clear
    print_banner
    echo -e "${GREEN}Company: $COMPANY${NC}"
    echo -e "${GREEN}Public IP: $PUBLIC_IP${NC}"
    echo
    while true; do
        read -p "$(echo -e "${CYAN}Backend URL (e.g., api.example.com)${NC}: ")" BACKEND_URL
        if [[ -z "$BACKEND_URL" ]]; then
            log ERROR "Backend URL is required"
            continue
        fi

        # Strip protocol if provided
        BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|https\?://||' | sed 's|/.*||')

        # Validate DNS automatically
        log INFO "Validating DNS for $BACKEND_URL..."
        if validate_dns "$BACKEND_URL" "$PUBLIC_IP"; then
            log SUCCESS "Backend DNS validated ✓"
            break
        else
            log ERROR "DNS validation failed. Please ensure $BACKEND_URL points to $PUBLIC_IP"
            read -p "$(echo -e "${YELLOW}Continue anyway? (y/N)${NC}: ")" force_continue
            if [[ "$force_continue" =~ ^[Yy]$ ]]; then
                log WARN "Continuing without DNS validation for backend"
                break
            fi
        fi
    done

    # Frontend URL with automatic DNS validation
    clear
    print_banner
    echo -e "${GREEN}Company: $COMPANY${NC}"
    echo -e "${GREEN}Backend: $BACKEND_URL${NC}"
    echo
    while true; do
        read -p "$(echo -e "${CYAN}Frontend URL (e.g., app.example.com)${NC}: ")" FRONTEND_URL
        if [[ -z "$FRONTEND_URL" ]]; then
            log ERROR "Frontend URL is required"
            continue
        fi

        # Strip protocol if provided
        FRONTEND_URL=$(echo "$FRONTEND_URL" | sed 's|https\?://||' | sed 's|/.*||')

        # Validate DNS automatically
        log INFO "Validating DNS for $FRONTEND_URL..."
        if validate_dns "$FRONTEND_URL" "$PUBLIC_IP"; then
            log SUCCESS "Frontend DNS validated ✓"
            break
        else
            log ERROR "DNS validation failed. Please ensure $FRONTEND_URL points to $PUBLIC_IP"
            read -p "$(echo -e "${YELLOW}Continue anyway? (y/N)${NC}: ")" force_continue
            if [[ "$force_continue" =~ ^[Yy]$ ]]; then
                log WARN "Continuing without DNS validation for frontend"
                break
            fi
        fi
    done

    # Admin email with validation
    clear
    print_banner
    echo -e "${GREEN}Company: $COMPANY${NC}"
    echo -e "${GREEN}Backend: $BACKEND_URL${NC}"
    echo -e "${GREEN}Frontend: $FRONTEND_URL${NC}"
    echo
    while true; do
        read -p "$(echo -e "${CYAN}Admin email${NC}: ")" ADMIN_EMAIL
        if [[ -z "$ADMIN_EMAIL" ]]; then
            log ERROR "Email is required"
            continue
        fi

        if ! validate_email "$ADMIN_EMAIL"; then
            log ERROR "Invalid email format. Please use format: user@domain.com"
            continue
        fi

        log SUCCESS "Email validated: $ADMIN_EMAIL ✓"
        break
    done

    # Admin password
    clear
    print_banner
    echo -e "${GREEN}Company: $COMPANY${NC}"
    echo -e "${GREEN}Admin Email: $ADMIN_EMAIL${NC}"
    echo
    wizard_password "Admin password (min 8 characters)" "ADMIN_PASSWORD"

    # Database password
    clear
    print_banner
    echo -e "${GREEN}Company: $COMPANY${NC}"
    echo -e "${GREEN}Admin Email: $ADMIN_EMAIL${NC}"
    echo
    wizard_password "Database password (min 8 characters)" "DEPLOY_PASSWORD"

    # Support phone with validation
    clear
    print_banner
    echo -e "${GREEN}Company: $COMPANY${NC}"
    echo
    while true; do
        read -p "$(echo -e "${CYAN}Support phone (10-15 digits)${NC}: ")" SUPPORT_PHONE
        if [[ -z "$SUPPORT_PHONE" ]]; then
            log ERROR "Phone number is required"
            continue
        fi

        SUPPORT_PHONE=$(validate_and_format_phone "$SUPPORT_PHONE")
        if [[ $? -ne 0 ]]; then
            log ERROR "Invalid phone number. Must be 10-15 digits"
            log INFO "Examples: 5511999999999, +1234567890, (11) 99999-9999"
            continue
        fi

        log SUCCESS "Phone validated: $SUPPORT_PHONE ✓"
        break
    done

    # Optional configurations
    clear
    print_banner
    echo -e "${GREEN}Company: $COMPANY${NC}"
    echo
    echo -e "${CYAN}Optional Configurations (press Enter to skip):${NC}"
    echo

    # Facebook integration (optional)
    read -p "$(echo -e "${DIM}Facebook App ID (optional):${NC} ")" FB_APP_ID
    if [[ -n "$FB_APP_ID" ]]; then
        read -p "$(echo -e "${DIM}Facebook App Secret:${NC} ")" FB_APP_SECRET
    fi

    # SSL is always enabled by default
    SKIP_SSL_SETUP=false
    SKIP_DNS_VALIDATION=false

    # Summary
    clear
    print_banner
    echo -e "${BOLD}${GREEN}=== Installation Summary ===${NC}"
    echo
    echo -e "${CYAN}Repository:${NC} $GITHUB_REPO"
    echo -e "${CYAN}Branch:${NC} $GITHUB_BRANCH"
    echo -e "${CYAN}Company:${NC} $COMPANY"
    echo -e "${CYAN}Build Mode:${NC} ${GREEN}FORCE BUILD FROM SOURCE (Real Code)${NC}"
    echo -e "${CYAN}Backend:${NC} https://$BACKEND_URL"
    echo -e "${CYAN}Frontend:${NC} https://$FRONTEND_URL"
    echo -e "${CYAN}Admin Email:${NC} $ADMIN_EMAIL"
    echo -e "${CYAN}Support Phone:${NC} $SUPPORT_PHONE"
    echo
    echo -e "${GREEN}✓ Passwords configured${NC}"
    echo -e "${GREEN}✓ DNS Validated${NC}"
    echo -e "${GREEN}✓ SSL will be configured${NC}"
    echo

    # Confirm to proceed
    read -p "$(echo -e "${YELLOW}Press Enter to start installation or Ctrl+C to cancel...${NC}")"
    echo
    log INFO "Starting installation..."
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

    # PRIORITY: Always clone and build from source
    local artifacts_downloaded=false

    # Check if FORCE_BUILD_FROM_SOURCE is true or if we should try releases first
    if [[ "$FORCE_BUILD_FROM_SOURCE" == "true" ]]; then
        log INFO "Force build from source enabled - skipping release artifacts"

        # Always clone the repository
        log INFO "Cloning repository from GitHub..."

        # Move to a working directory
        cd "${BASE_DIR}/${COMPANY}" 2>/dev/null || mkdir -p "${BASE_DIR}/${COMPANY}" && cd "${BASE_DIR}/${COMPANY}"

        # Clone the repository
        if clone_repository "$COMPANY"; then
            log SUCCESS "Repository cloned successfully"

            # Build from source
            log INFO "Building ChatIA Flow from source..."
            if build_from_source "$COMPANY"; then
                artifacts_downloaded=true
                log SUCCESS "ChatIA Flow built successfully from source"
            else
                log ERROR "Build failed!"
            fi
        else
            log ERROR "Failed to clone repository!"
        fi
    else
        # Try to download artifacts first (old behavior)
        if download_artifacts "$COMPANY"; then
            # Check if artifacts actually created the needed directories
            if [[ -f "${BASE_DIR}/${COMPANY}/backend/dist/server.js" ]] && [[ -f "${BASE_DIR}/${COMPANY}/frontend/build/server.js" ]]; then
                artifacts_downloaded=true
                log SUCCESS "Artifacts downloaded and extracted successfully"
            else
                log WARN "Artifacts downloaded but files are missing"
            fi
        fi
    fi

    # If artifacts/build failed, try alternate approach
    if [[ "$artifacts_downloaded" == "false" ]]; then
        log WARN "Primary installation method failed, trying alternate approach..."

        # Check if source code exists locally (maybe from a previous attempt)
        if [[ -d "${BASE_DIR}/${COMPANY}/backend" && -d "${BASE_DIR}/${COMPANY}/frontend" ]]; then
            log INFO "Found existing source code, attempting to build..."
            cd "${BASE_DIR}/${COMPANY}"
            if build_from_source "$COMPANY"; then
                artifacts_downloaded=true
                log SUCCESS "Built from existing source code"
            fi
        else
            # Last attempt: clone and build
            log INFO "Making final attempt to clone and build..."
            cd "${BASE_DIR}/${COMPANY}" 2>/dev/null || mkdir -p "${BASE_DIR}/${COMPANY}" && cd "${BASE_DIR}/${COMPANY}"

            if clone_repository "$COMPANY"; then
                if build_from_source "$COMPANY"; then
                    artifacts_downloaded=true
                    log SUCCESS "Successfully cloned and built ChatIA Flow"
                fi
            fi
        fi
    fi

    # NEVER create minimal structure - fail instead
    if [[ "$artifacts_downloaded" == "false" ]]; then
        log ERROR "=================================="
        log ERROR "INSTALLATION FAILED"
        log ERROR "=================================="
        log ERROR "Could not install ChatIA Flow. Possible causes:"
        log ERROR "1. Repository ${GITHUB_REPO} doesn't exist or is private"
        log ERROR "2. Network issues preventing clone"
        log ERROR "3. Build dependencies are missing"
        log ERROR ""
        log ERROR "To fix:"
        log ERROR "1. Verify repository: https://github.com/${GITHUB_REPO}"
        log ERROR "2. Check network connectivity"
        log ERROR "3. Try setting GITHUB_TOKEN environment variable if repo is private"
        log ERROR "4. Check the log file: $LOG_FILE"
        exit 1
    fi
    # Verify installation succeeded
    if [[ ! -f "${BASE_DIR}/${COMPANY}/backend/dist/server.js" ]] && [[ ! -f "${BASE_DIR}/${COMPANY}/backend/server.js" ]]; then
        log ERROR "Backend server.js not found after build!"
        log ERROR "Installation cannot continue without backend code"
        exit 1
    fi

    if [[ ! -d "${BASE_DIR}/${COMPANY}/frontend/build" ]] && [[ ! -f "${BASE_DIR}/${COMPANY}/frontend/build/index.html" ]]; then
        log WARN "Frontend build directory incomplete, checking..."
        # Try to ensure at least the server exists
        if [[ ! -f "${BASE_DIR}/${COMPANY}/frontend/build/server.js" ]]; then
            log INFO "Creating frontend server..."
            mkdir -p "${BASE_DIR}/${COMPANY}/frontend/build"
            create_frontend_server "${BASE_DIR}/${COMPANY}/frontend/build"
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
    echo -e "${BOLD}${YELLOW}LOGIN CREDENTIALS:${NC}"
    echo -e "  ${CYAN}Email:${NC}    ${GREEN}${ADMIN_EMAIL}${NC}"
    echo -e "  ${CYAN}Password:${NC} ${GREEN}${BOLD}${ADMIN_PASSWORD}${NC}"
    echo
    echo -e "${BOLD}${YELLOW}DATABASE CREDENTIALS:${NC}"
    echo -e "  ${CYAN}Database:${NC} ${GREEN}${COMPANY}${NC}"
    echo -e "  ${CYAN}User:${NC}     ${GREEN}${COMPANY}${NC}"
    echo -e "  ${CYAN}Password:${NC} ${GREEN}${BOLD}${DEPLOY_PASSWORD}${NC}"
    echo
    echo -e "${CYAN}${BOLD}Service Management:${NC}"
    echo -e "  View status:  ${GREEN}pm2 status${NC}"
    echo -e "  View logs:    ${GREEN}pm2 logs${NC}"
    echo -e "  Monitor:      ${GREEN}pm2 monit${NC}"
    echo -e "  Restart all:  ${GREEN}pm2 restart all${NC}"
    echo
    echo -e "${YELLOW}${BOLD}Important Files:${NC}"
    echo -e "  Backend env:  ${DIM}/home/deploy/${COMPANY}/backend/.env${NC}"
    echo -e "  Frontend env: ${DIM}/home/deploy/${COMPANY}/frontend/.env${NC}"
    echo -e "  Install log:  ${DIM}${LOG_FILE}${NC}"
    echo
    echo -e "${YELLOW}${BOLD}Next Steps:${NC}"
    echo -e "  1. Save the credentials shown above securely"
    echo -e "  2. Access ${GREEN}https://${FRONTEND_URL}${NC} and login"
    echo -e "  3. Configure WhatsApp connections"
    echo -e "  4. Setup your team and permissions"
    echo -e "  5. Import contacts and start messaging!"
    echo
    echo -e "${BOLD}${GREEN}Thank you for choosing ChatIA Flow!${NC}"
    echo
}

# Run main function
main "$@"