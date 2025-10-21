# ChatIA Flow - Installation Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Installation Methods](#installation-methods)
  - [Quick Install (Recommended)](#quick-install-recommended)
  - [Manual Installation](#manual-installation)
  - [Docker Installation](#docker-installation)
- [Configuration](#configuration)
- [Post-Installation](#post-installation)
- [Troubleshooting](#troubleshooting)
- [Updates](#updates)

## 🎯 Overview

ChatIA Flow v6.0 introduces a modern, streamlined installation process that leverages GitHub Actions for automated builds and releases. The new installer provides:

- 🚀 **One-command installation** with interactive wizard
- 📦 **Pre-built artifacts** from GitHub Actions
- 🔒 **Automatic SSL setup** with Let's Encrypt
- 🔄 **Automated migrations** and database setup
- 📊 **Progress tracking** and detailed logging
- 🛡️ **Security hardening** out of the box
- 🔧 **Zero-downtime updates** support

## 💻 Requirements

### System Requirements

- **OS**: Ubuntu 20.04+ or Debian 11+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 10GB free space
- **CPU**: 2+ cores recommended
- **Network**: Public IP with ports 80/443 available

### Software Requirements

- **Node.js**: 20.x (automatically installed)
- **PostgreSQL**: 13+ (automatically installed)
- **Redis**: 6+ (automatically installed)
- **Nginx**: Latest (automatically installed)

### DNS Requirements

- Two domains/subdomains pointing to your server:
  - Backend API (e.g., `api.yourdomain.com`)
  - Frontend App (e.g., `app.yourdomain.com`)

## 🚀 Installation Methods

### Quick Install (Recommended)

The fastest way to get ChatIA Flow running on your server:

```bash
# Download the latest installer
curl -fsSL https://github.com/chatia/chatia-flow/releases/latest/download/install-chatia.sh -o install-chatia.sh

# Make it executable
chmod +x install-chatia.sh

# Run with sudo
sudo ./install-chatia.sh
```

The installer will guide you through an interactive setup wizard.

### Non-Interactive Installation

For automated deployments, you can run the installer in non-interactive mode:

```bash
# Export required variables
export NON_INTERACTIVE=true
export COMPANY="mycompany"
export BACKEND_URL="api.example.com"
export FRONTEND_URL="app.example.com"
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="SecurePassword123"
export DEPLOY_PASSWORD="DatabasePassword123"
export SUPPORT_PHONE="5511999999999"

# Optional configurations
export SKIP_DNS_VALIDATION=false
export SKIP_SSL_SETUP=false
export FB_APP_ID="your_facebook_app_id"
export FB_APP_SECRET="your_facebook_secret"
export GITHUB_TOKEN="your_github_token"  # For private repos

# Run installer
sudo ./install-chatia.sh
```

### Manual Installation

For advanced users who want full control:

1. **Download artifacts manually:**

```bash
# Get the manifest
wget https://github.com/chatia/chatia-flow/releases/latest/download/manifest.json

# Parse and download artifacts
VERSION=$(jq -r .version manifest.json)
wget https://github.com/chatia/chatia-flow/releases/download/${VERSION}/backend_dist.tar.gz
wget https://github.com/chatia/chatia-flow/releases/download/${VERSION}/backend_node_modules.tar.gz
wget https://github.com/chatia/chatia-flow/releases/download/${VERSION}/frontend_build.tar.gz
```

2. **Extract artifacts:**

```bash
# Create directories
mkdir -p /home/deploy/chatia/{backend,frontend}

# Extract backend
tar -xzf backend_dist.tar.gz -C /home/deploy/chatia/backend/
tar -xzf backend_node_modules.tar.gz -C /home/deploy/chatia/backend/

# Extract frontend
tar -xzf frontend_build.tar.gz -C /home/deploy/chatia/frontend/
```

3. **Configure environment files:**

Create `/home/deploy/chatia/backend/.env`:

```env
# Database
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatia
DB_USER=chatia
DB_PASS=your_password

# Redis
REDIS_URI_ACK=redis://localhost:6379/1
REDIS_URI_MSG_CONN=redis://localhost:6379/2

# Server
PORT=8080
HOST=0.0.0.0
FRONTEND_URL=https://app.yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_admin_password

NODE_ENV=production
```

Create `/home/deploy/chatia/frontend/.env`:

```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
PORT=3000
NODE_ENV=production
```

4. **Run database migrations:**

```bash
cd /home/deploy/chatia/backend
npx sequelize db:migrate
```

5. **Start services with PM2:**

```bash
# Backend
pm2 start dist/server.js --name chatia-backend -i 2

# Frontend
cd /home/deploy/chatia/frontend/build
pm2 start server.js --name chatia-frontend

# Save PM2 configuration
pm2 save
pm2 startup
```

### Docker Installation

For containerized deployments:

```bash
# Pull the image
docker pull ghcr.io/chatia/chatia-flow:latest

# Run with docker-compose
curl -O https://raw.githubusercontent.com/chatia/chatia-flow/main/docker-compose.yml
docker-compose up -d
```

## ⚙️ Configuration

### Environment Variables

The installer creates configuration files in:
- Backend: `/home/deploy/{company}/backend/.env`
- Frontend: `/home/deploy/{company}/frontend/.env`

### Nginx Configuration

Nginx configurations are created in:
- `/etc/nginx/sites-available/{company}-backend`
- `/etc/nginx/sites-available/{company}-frontend`

### SSL Certificates

SSL certificates are automatically obtained using Certbot:
- Certificates stored in `/etc/letsencrypt/live/`
- Auto-renewal configured via cron

### Database

PostgreSQL configuration:
- Database name: `{company}`
- Database user: `{company}`
- Connection via localhost

## 📝 Post-Installation

### 1. Verify Services

```bash
# Check PM2 services
pm2 status

# Check logs
pm2 logs

# Monitor resources
pm2 monit
```

### 2. Test Endpoints

```bash
# Test backend
curl https://api.yourdomain.com/health

# Test frontend
curl https://app.yourdomain.com
```

### 3. Access the Application

1. Open your browser and navigate to `https://app.yourdomain.com`
2. Login with the admin credentials you configured
3. Complete the initial setup wizard

### 4. Configure WhatsApp

1. Go to Settings → Connections
2. Click "Add WhatsApp"
3. Scan the QR code with your WhatsApp
4. Configure message templates

### 5. Security Hardening

The installer automatically configures:
- ✅ UFW firewall (ports 22, 80, 443 only)
- ✅ Fail2ban for SSH protection
- ✅ Nginx security headers
- ✅ PM2 process management
- ✅ Automatic backups via cron

## 🔧 Troubleshooting

### Common Issues

#### DNS not resolving

```bash
# Check DNS propagation
dig +short api.yourdomain.com
dig +short app.yourdomain.com

# Should return your server's IP
```

#### Services not starting

```bash
# Check PM2 logs
pm2 logs chatia-backend --lines 100
pm2 logs chatia-frontend --lines 100

# Restart services
pm2 restart all
```

#### Database connection issues

```bash
# Check PostgreSQL status
systemctl status postgresql

# Test connection
sudo -u postgres psql -c "\l"
```

#### SSL certificate issues

```bash
# Test certificate renewal
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal
```

### Log Files

Installation logs are stored in:
- Main log: `/var/log/chatia/install-{timestamp}.log`
- PM2 logs: `/home/deploy/.pm2/logs/`
- Nginx logs: `/var/log/chatia/{company}-{service}-{access|error}.log`

### Recovery

If installation fails, check the state file:
```bash
cat /etc/chatia/install.state
```

To retry from a specific point:
```bash
# Edit state file to remove completed steps
nano /etc/chatia/install.state

# Re-run installer
sudo ./install-chatia.sh
```

## 🔄 Updates

### Automatic Updates

To update to the latest version:

```bash
# Download latest installer
curl -fsSL https://github.com/chatia/chatia-flow/releases/latest/download/install-chatia.sh -o update-chatia.sh
chmod +x update-chatia.sh

# Run update (preserves configuration)
sudo ./update-chatia.sh --update
```

### Manual Updates

```bash
# Backup current installation
tar -czf backup-$(date +%Y%m%d).tar.gz /home/deploy/chatia

# Download new artifacts
wget https://github.com/chatia/chatia-flow/releases/latest/download/manifest.json
# ... download and extract new artifacts ...

# Run migrations
cd /home/deploy/chatia/backend
npx sequelize db:migrate

# Restart services
pm2 restart all
```

### Rollback

To rollback to a previous version:

```bash
# Restore from backup
tar -xzf backup-{date}.tar.gz -C /

# Downgrade database if needed
cd /home/deploy/chatia/backend
npx sequelize db:migrate:undo

# Restart services
pm2 restart all
```

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/health

# Frontend health
curl https://app.yourdomain.com

# Database health
sudo -u postgres pg_isready

# Redis health
redis-cli ping
```

### Performance Monitoring

```bash
# PM2 monitoring
pm2 monit

# System resources
htop

# Network connections
netstat -tulpn

# Disk usage
df -h
```

### Backup Verification

```bash
# List backups
ls -la /home/deploy/chatia/backups/

# Test backup restore (dry-run)
pg_dump -U chatia chatia > test-backup.sql
```

## 🆘 Support

### Documentation
- Full docs: https://docs.chatia.com
- API Reference: https://docs.chatia.com/api
- Video tutorials: https://youtube.com/@chatia

### Community
- GitHub Issues: https://github.com/chatia/chatia-flow/issues
- Discord: https://discord.gg/chatia
- Forum: https://community.chatia.com

### Professional Support
- Email: support@chatia.com
- Enterprise: enterprise@chatia.com

---

## 📄 License

ChatIA Flow is licensed under the MIT License. See [LICENSE](https://github.com/chatia/chatia-flow/blob/main/LICENSE) for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/chatia/chatia-flow/blob/main/CONTRIBUTING.md) for details.